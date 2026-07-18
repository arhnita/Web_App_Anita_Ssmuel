import { Router } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/users/officers:
 *   get:
 *     summary: Get all maintenance officers (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/officers',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req: any, res: any) => {
        const officers = await prisma.user.findMany({
            where: {
                role: 'MAINTENANCE_OFFICER',
                isActive: true
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                department: true,
                _count: {
                    select: {
                        assignmentsAsOfficer: true
                    }
                }
            },
            orderBy: { firstName: 'asc' }
        });

        res.json({
            success: true,
            data: officers
        });
    })
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user details
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get(
    '/:id',
    authenticate,
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;

        // Users can only view their own profile unless admin
        if (id !== req.user.id && req.user.role !== 'ADMIN') {
            throw new AppError('You do not have permission to view this user', 403);
        }

        const user = await prisma.user.findUnique({
            where: { id },
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
                        requests: true
                    }
                }
            }
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({
            success: true,
            data: user
        });
    })
);

export default router;
