import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '@prisma/client';

const router = Router();

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all request categories
 *     tags: [Categories]
 */
router.get(
    '/',
    asyncHandler(async (req: any, res: any) => {
        const categories = await prisma.requestCategory.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: {
                        requests: true
                    }
                }
            }
        });

        res.json({
            success: true,
            data: categories
        });
    })
);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     summary: Get a single category
 *     tags: [Categories]
 */
router.get(
    '/:id',
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;

        const category = await prisma.requestCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        requests: true
                    }
                }
            }
        });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        res.json({
            success: true,
            data: category
        });
    })
);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.post(
    '/',
    authenticate,
    authorize(Role.ADMIN),
    [
        body('name').notEmpty().withMessage('Category name is required'),
        body('description').optional(),
        body('icon').optional()
    ],
    asyncHandler(async (req: any, res: any) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }

        const { name, description, icon } = req.body;

        // Check if category already exists
        const existing = await prisma.requestCategory.findUnique({
            where: { name }
        });

        if (existing) {
            throw new AppError('Category already exists', 400);
        }

        const category = await prisma.requestCategory.create({
            data: {
                name,
                description,
                icon
            }
        });

        res.status(201).json({
            success: true,
            message: 'Category created successfully',
            data: category
        });
    })
);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     summary: Update a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.put(
    '/:id',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;
        const { name, description, icon, isActive } = req.body;

        const category = await prisma.requestCategory.findUnique({
            where: { id }
        });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        const updatedCategory = await prisma.requestCategory.update({
            where: { id },
            data: {
                ...(name && { name }),
                ...(description !== undefined && { description }),
                ...(icon !== undefined && { icon }),
                ...(isActive !== undefined && { isActive })
            }
        });

        res.json({
            success: true,
            message: 'Category updated successfully',
            data: updatedCategory
        });
    })
);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     summary: Delete a category (Admin only)
 *     tags: [Categories]
 *     security:
 *       - bearerAuth: []
 */
router.delete(
    '/:id',
    authenticate,
    authorize(Role.ADMIN),
    asyncHandler(async (req: any, res: any) => {
        const { id } = req.params;

        const category = await prisma.requestCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        requests: true
                    }
                }
            }
        });

        if (!category) {
            throw new AppError('Category not found', 404);
        }

        // If category has requests, deactivate instead of delete
        if (category._count.requests > 0) {
            await prisma.requestCategory.update({
                where: { id },
                data: { isActive: false }
            });

            return res.json({
                success: true,
                message: 'Category deactivated (has existing requests)'
            });
        }

        await prisma.requestCategory.delete({
            where: { id }
        });

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    })
);

export default router;
