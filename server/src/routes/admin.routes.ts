import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { Role, RequestStatus } from '@prisma/client';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(Role.ADMIN));

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/dashboard',
    asyncHandler(async (req: any, res: any) => {
        // Get counts
        const [
            totalUsers,
            totalRequests,
            pendingRequests,
            assignedRequests,
            inProgressRequests,
            completedRequests,
            cancelledRequests,
            totalOfficers,
            recentRequests
        ] = await Promise.all([
            prisma.user.count(),
            prisma.serviceRequest.count(),
            prisma.serviceRequest.count({ where: { status: 'PENDING' } }),
            prisma.serviceRequest.count({ where: { status: 'ASSIGNED' } }),
            prisma.serviceRequest.count({ where: { status: 'IN_PROGRESS' } }),
            prisma.serviceRequest.count({ where: { status: 'COMPLETED' } }),
            prisma.serviceRequest.count({ where: { status: 'CANCELLED' } }),
            prisma.user.count({ where: { role: 'MAINTENANCE_OFFICER' } }),
            prisma.serviceRequest.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: {
                    category: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true
                        }
                    }
                }
            })
        ]);

        // Get requests by category
        const requestsByCategory = await prisma.requestCategory.findMany({
            include: {
                _count: {
                    select: {
                        requests: true
                    }
                }
            }
        });

        // Get requests by priority
        const requestsByPriority = await prisma.serviceRequest.groupBy({
            by: ['priority'],
            _count: {
                priority: true
            }
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalRequests,
                    totalOfficers,
                    pendingRequests,
                    assignedRequests,
                    inProgressRequests,
                    completedRequests,
                    cancelledRequests
                },
                requestsByCategory: requestsByCategory.map(c => ({
                    name: c.name,
                    count: c._count.requests
                })),
                requestsByPriority,
                recentRequests
            }
        });
    })
);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (with pagination)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/users',
    asyncHandler(async (req: any, res: any) => {
        const { role, search, page = 1, limit = 10, isActive } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where: any = {};

        if (role) {
            where.role = role;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        if (search) {
            where.OR = [
                { firstName: { contains: search, mode: 'insensitive' } },
                { lastName: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    email: true,
                    firstName: true,
                    lastName: true,
                    phone: true,
                    department: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    _count: {
                        select: {
                            requests: true,
                            assignmentsAsOfficer: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / take)
                }
            }
        });
    })
);

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Create a new user (Admin can create officers)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/users',
    [
        body('email').isEmail().withMessage('Please provide a valid email'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('firstName').notEmpty().withMessage('First name is required'),
        body('lastName').notEmpty().withMessage('Last name is required'),
        body('role').isIn(['STUDENT', 'STAFF', 'MAINTENANCE_OFFICER', 'ADMIN'])
    ],
    asyncHandler(async (req: any, res: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { email, password, firstName, lastName, phone, department, role } = req.body;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            throw new AppError('Email already registered', 400);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone,
                department,
                role
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
                department: true,
                createdAt: true
            }
        });

        res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: user
        });
    })
);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     summary: Update user role
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/users/:id/role',
    [
        body('role').isIn(['STUDENT', 'STAFF', 'MAINTENANCE_OFFICER', 'ADMIN'])
    ],
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;
        const { role } = req.body;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Prevent admin from changing their own role
        if (id === req.user.id) {
            throw new AppError('Cannot change your own role', 400);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { role },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true
            }
        });

        res.json({
            success: true,
            message: 'User role updated successfully',
            data: updatedUser
        });
    })
);

/**
 * @swagger
 * /api/admin/users/{id}/status:
 *   put:
 *     summary: Activate/Deactivate user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/users/:id/status',
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await prisma.user.findUnique({
            where: { id }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        // Prevent admin from deactivating themselves
        if (id === req.user.id) {
            throw new AppError('Cannot deactivate your own account', 400);
        }

        const updatedUser = await prisma.user.update({
            where: { id },
            data: { isActive },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                isActive: true
            }
        });

        res.json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: updatedUser
        });
    })
);

/**
 * @swagger
 * /api/admin/requests:
 *   get:
 *     summary: Get all requests (Admin view)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/requests',
    asyncHandler(async (req: any, res: any) => {
        const {
            status,
            priority,
            categoryId,
            search,
            page = 1,
            limit = 10,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where: any = {};

        if (status) where.status = status;
        if (priority) where.priority = priority;
        if (categoryId) where.categoryId = categoryId;
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } }
            ];
        }

        const [requests, total] = await Promise.all([
            prisma.serviceRequest.findMany({
                where,
                include: {
                    category: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            department: true
                        }
                    },
                    assignments: {
                        include: {
                            officer: {
                                select: {
                                    id: true,
                                    firstName: true,
                                    lastName: true
                                }
                            }
                        }
                    }
                },
                orderBy: {
                    [sortBy]: sortOrder
                },
                skip,
                take
            }),
            prisma.serviceRequest.count({ where })
        ]);

        res.json({
            success: true,
            data: {
                requests,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / take)
                }
            }
        });
    })
);

/**
 * @swagger
 * /api/admin/requests/{id}/assign:
 *   post:
 *     summary: Assign request to maintenance officer
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/requests/:id/assign',
    [
        body('officerId').notEmpty().withMessage('Officer ID is required'),
        body('notes').optional()
    ],
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;
        const { officerId, notes } = req.body;

        // Verify request exists
        const request = await prisma.serviceRequest.findUnique({
            where: { id }
        });

        if (!request) {
            throw new AppError('Request not found', 404);
        }

        // Verify officer exists and is a maintenance officer
        const officer = await prisma.user.findUnique({
            where: { id: officerId }
        });

        if (!officer) {
            throw new AppError('Officer not found', 404);
        }

        if (officer.role !== 'MAINTENANCE_OFFICER') {
            throw new AppError('User is not a maintenance officer', 400);
        }

        // Check if already assigned to this officer
        const existingAssignment = await prisma.assignment.findFirst({
            where: {
                requestId: id,
                officerId
            }
        });

        if (existingAssignment) {
            throw new AppError('Request already assigned to this officer', 400);
        }

        // Create assignment
        const assignment = await prisma.assignment.create({
            data: {
                requestId: id,
                officerId,
                assignedById: req.user.id,
                notes
            },
            include: {
                officer: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Update request status to ASSIGNED if it was PENDING
        const previousStatus = request.status;
        if (request.status === 'PENDING') {
            await prisma.serviceRequest.update({
                where: { id },
                data: { status: 'ASSIGNED' }
            });

            // Create status log
            await prisma.statusLog.create({
                data: {
                    requestId: id,
                    previousStatus,
                    newStatus: 'ASSIGNED',
                    changedById: req.user.id,
                    comments: `Assigned to ${officer.firstName} ${officer.lastName}`
                }
            });
        }

        res.status(201).json({
            success: true,
            message: 'Request assigned successfully',
            data: assignment
        });
    })
);

/**
 * @swagger
 * /api/admin/reports:
 *   get:
 *     summary: Get reports data
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/reports',
    asyncHandler(async (req: any, res: any) => {
        const { startDate, endDate } = req.query;

        const dateFilter: any = {};
        if (startDate) {
            dateFilter.createdAt = {
                gte: new Date(startDate)
            };
        }
        if (endDate) {
            dateFilter.createdAt = {
                ...dateFilter.createdAt,
                lte: new Date(endDate)
            };
        }

        // Get all requests in date range for summary
        const allRequests = await prisma.serviceRequest.findMany({
            where: dateFilter,
            select: { status: true, createdAt: true, updatedAt: true }
        });

        const totalRequests = allRequests.length;
        const completedRequests = allRequests.filter(r => r.status === 'COMPLETED').length;
        const pendingRequests = allRequests.filter(r => r.status === 'PENDING').length;

        // Calculate average completion time for completed requests
        const completedWithTime = allRequests.filter(r => r.status === 'COMPLETED');
        let avgCompletionTime = 'N/A';
        if (completedWithTime.length > 0) {
            const totalTime = completedWithTime.reduce((sum, r) => {
                return sum + (new Date(r.updatedAt).getTime() - new Date(r.createdAt).getTime());
            }, 0);
            const avgMs = totalTime / completedWithTime.length;
            const avgDays = Math.round(avgMs / (1000 * 60 * 60 * 24));
            avgCompletionTime = avgDays <= 0 ? '< 1 day' : `${avgDays} days`;
        }

        const completionRate = totalRequests > 0
            ? `${Math.round((completedRequests / totalRequests) * 100)}%`
            : '0%';

        // Requests by status
        const requestsByStatus = await prisma.serviceRequest.groupBy({
            by: ['status'],
            where: dateFilter,
            _count: {
                status: true
            }
        });

        // Requests by category
        const requestsByCategory = await prisma.serviceRequest.groupBy({
            by: ['categoryId'],
            where: dateFilter,
            _count: {
                categoryId: true
            }
        });

        // Get category names
        const categories = await prisma.requestCategory.findMany();
        const categoryMap = Object.fromEntries(categories.map(c => [c.id, c.name]));

        // Requests by priority
        const requestsByPriority = await prisma.serviceRequest.groupBy({
            by: ['priority'],
            where: dateFilter,
            _count: {
                priority: true
            }
        });

        // Top officers by completed tasks
        const completedAssignments = await prisma.assignment.findMany({
            where: {
                request: {
                    status: 'COMPLETED',
                    ...dateFilter
                }
            },
            include: {
                officer: {
                    select: { id: true, firstName: true, lastName: true }
                }
            }
        });

        // Count completions per officer
        const officerCounts: Record<string, { firstName: string; lastName: string; count: number }> = {};
        completedAssignments.forEach(a => {
            if (!officerCounts[a.officerId]) {
                officerCounts[a.officerId] = {
                    firstName: a.officer.firstName,
                    lastName: a.officer.lastName,
                    count: 0
                };
            }
            officerCounts[a.officerId].count++;
        });

        const topOfficers = Object.values(officerCounts)
            .sort((a, b) => b.count - a.count)
            .slice(0, 5)
            .map(o => ({
                firstName: o.firstName,
                lastName: o.lastName,
                completedCount: o.count
            }));

        res.json({
            success: true,
            data: {
                period: {
                    startDate: startDate || 'All time',
                    endDate: endDate || 'Present'
                },
                summary: {
                    totalRequests,
                    completedRequests,
                    pendingRequests,
                    averageCompletionTime: avgCompletionTime,
                    completionRate
                },
                requestsByStatus: requestsByStatus.map(r => ({
                    status: r.status,
                    count: r._count.status
                })),
                requestsByCategory: requestsByCategory.map(r => ({
                    name: categoryMap[r.categoryId] || 'Unknown',
                    count: r._count.categoryId
                })),
                requestsByPriority: requestsByPriority.map(r => ({
                    priority: r.priority,
                    count: r._count.priority
                })),
                topOfficers
            }
        });
    })
);

export default router;
