import { Router } from 'express';
import { body, query, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { Role, RequestStatus, Priority } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/requests:
 *   post:
 *     summary: Create a new service request
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticate,
    [
        body('title').notEmpty().withMessage('Title is required'),
        body('description').notEmpty().withMessage('Description is required'),
        body('location').notEmpty().withMessage('Location is required'),
        body('categoryId').notEmpty().withMessage('Category is required'),
        body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
    ],
    asyncHandler(async (req: any, res: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { title, description, location, categoryId, priority, imageUrl } = req.body;

        // Verify category exists
        const category = await prisma.requestCategory.findUnique({
            where: { id: categoryId }
        });

        if (!category) {
            throw new AppError('Invalid category', 400);
        }

        // Create service request
        const request = await prisma.serviceRequest.create({
            data: {
                title,
                description,
                location,
                categoryId,
                priority: priority || 'MEDIUM',
                imageUrl,
                userId: req.user.id,
                status: 'PENDING'
            },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Create initial status log
        await prisma.statusLog.create({
            data: {
                requestId: request.id,
                previousStatus: 'PENDING',
                newStatus: 'PENDING',
                changedById: req.user.id,
                comments: 'Request created'
            }
        });

        res.status(201).json({
            success: true,
            message: 'Service request created successfully',
            data: request
        });
    })
);

/**
 * @swagger
 * /api/requests:
 *   get:
 *     summary: Get all service requests (with filters)
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/',
    authenticate,
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

        // Build where clause based on user role
        let where: any = {};

        // Students/Staff can only see their own requests
        if (req.user.role === 'STUDENT' || req.user.role === 'STAFF') {
            where.userId = req.user.id;
        }

        // Maintenance officers see assigned requests
        if (req.user.role === 'MAINTENANCE_OFFICER') {
            where.assignments = {
                some: {
                    officerId: req.user.id
                }
            };
        }

        // Apply filters
        if (status) {
            where.status = status;
        }
        if (priority) {
            where.priority = priority;
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
                { location: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Get requests with pagination
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
                    },
                    _count: {
                        select: {
                            statusLogs: true
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
 * /api/requests/my-requests:
 *   get:
 *     summary: Get current user's requests
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/my-requests',
    authenticate,
    asyncHandler(async (req: any, res: any) => {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where: any = { userId: req.user.id };
        if (status) {
            where.status = status;
        }

        const [requests, total] = await Promise.all([
            prisma.serviceRequest.findMany({
                where,
                include: {
                    category: true,
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
                orderBy: { createdAt: 'desc' },
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
 * /api/requests/assigned:
 *   get:
 *     summary: Get requests assigned to current officer
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/assigned',
    authenticate,
    authorize(Role.MAINTENANCE_OFFICER, Role.ADMIN),
    asyncHandler(async (req: any, res: any) => {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const take = parseInt(limit);

        const where: any = {
            assignments: {
                some: {
                    officerId: req.user.id
                }
            }
        };
        if (status) {
            where.status = status;
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
                            department: true,
                            phone: true
                        }
                    },
                    assignments: true
                },
                orderBy: { createdAt: 'desc' },
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
 * /api/requests/{id}:
 *   get:
 *     summary: Get a single service request
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;

        const request = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        department: true,
                        phone: true
                    }
                },
                assignments: {
                    include: {
                        officer: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                email: true,
                                phone: true
                            }
                        },
                        assignedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true
                            }
                        }
                    }
                },
                statusLogs: {
                    include: {
                        changedBy: {
                            select: {
                                id: true,
                                firstName: true,
                                lastName: true,
                                role: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!request) {
            throw new AppError('Request not found', 404);
        }

        // Check access permissions
        const isOwner = request.userId === req.user.id;
        const isAssignedOfficer = request.assignments.some(a => a.officerId === req.user.id);
        const isAdmin = req.user.role === 'ADMIN';

        if (!isOwner && !isAssignedOfficer && !isAdmin) {
            throw new AppError('You do not have permission to view this request', 403);
        }

        res.json({
            success: true,
            data: request
        });
    })
);

/**
 * @swagger
 * /api/requests/{id}:
 *   put:
 *     summary: Update a service request
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id',
    authenticate,
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;
        const { title, description, location, priority, imageUrl } = req.body;

        const request = await prisma.serviceRequest.findUnique({
            where: { id }
        });

        if (!request) {
            throw new AppError('Request not found', 404);
        }

        // Only owner can update (and only if status is PENDING)
        if (request.userId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new AppError('You do not have permission to update this request', 403);
        }

        if (request.status !== 'PENDING' && req.user.role !== 'ADMIN') {
            throw new AppError('Cannot update request that is already being processed', 400);
        }

        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: {
                ...(title && { title }),
                ...(description && { description }),
                ...(location && { location }),
                ...(priority && { priority }),
                ...(imageUrl && { imageUrl })
            },
            include: {
                category: true
            }
        });

        res.json({
            success: true,
            message: 'Request updated successfully',
            data: updatedRequest
        });
    })
);

/**
 * @swagger
 * /api/requests/{id}/status:
 *   put:
 *     summary: Update request status
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id/status',
    authenticate,
    authorize(Role.MAINTENANCE_OFFICER, Role.ADMIN),
    [
        body('status').isIn(['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
        body('comments').optional()
    ],
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;
        const { status, comments } = req.body;

        const request = await prisma.serviceRequest.findUnique({
            where: { id },
            include: {
                assignments: true
            }
        });

        if (!request) {
            throw new AppError('Request not found', 404);
        }

        // Check if officer is assigned to this request (unless admin)
        if (req.user.role !== 'ADMIN') {
            const isAssigned = request.assignments.some(a => a.officerId === req.user.id);
            if (!isAssigned) {
                throw new AppError('You are not assigned to this request', 403);
            }
        }

        const previousStatus = request.status;

        // Update status
        const updatedRequest = await prisma.serviceRequest.update({
            where: { id },
            data: { status },
            include: {
                category: true,
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        // Create status log
        await prisma.statusLog.create({
            data: {
                requestId: id,
                previousStatus,
                newStatus: status,
                changedById: req.user.id,
                comments
            }
        });

        res.json({
            success: true,
            message: 'Status updated successfully',
            data: updatedRequest
        });
    })
);

/**
 * @swagger
 * /api/requests/{id}:
 *   delete:
 *     summary: Cancel/Delete a service request
 *     tags: [Service Requests]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/:id',
    authenticate,
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;

        const request = await prisma.serviceRequest.findUnique({
            where: { id }
        });

        if (!request) {
            throw new AppError('Request not found', 404);
        }

        // Only owner or admin can delete
        if (request.userId !== req.user.id && req.user.role !== 'ADMIN') {
            throw new AppError('You do not have permission to delete this request', 403);
        }

        // If already being processed, mark as cancelled instead of deleting
        if (request.status !== 'PENDING') {
            await prisma.serviceRequest.update({
                where: { id },
                data: { status: 'CANCELLED' }
            });

            await prisma.statusLog.create({
                data: {
                    requestId: id,
                    previousStatus: request.status,
                    newStatus: 'CANCELLED',
                    changedById: req.user.id,
                    comments: 'Request cancelled by user'
                }
            });

            return res.json({
                success: true,
                message: 'Request cancelled successfully'
            });
        }

        // Delete pending request
        await prisma.serviceRequest.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Request deleted successfully'
        });
    })
);

export default router;
