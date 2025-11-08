import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  getEditors,
  getWriters,
  getUserById,
  updateUserRole,
  toggleUserStatus,
  getUserStats
} from '../controllers/userController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const updateRoleValidation = [
  body('role')
    .notEmpty()
    .withMessage('Role is required')
    .isIn(['editor', 'writer'])
    .withMessage('Role must be either editor or writer')
];

// All routes require authentication
router.use(protect);

// Public to authenticated users (writers need to see editors)
router.get('/editors', authorize('writer', 'editor', 'admin'), getEditors);

// Admin and Editor can view writers
router.get('/writers', authorize('admin', 'editor'), getWriters);

// Admin only routes
router.get('/stats', authorize('admin'), getUserStats);
router.get('/', authorize('admin'), getAllUsers);
router.get('/:id', authorize('admin'), getUserById);
router.put('/:id/role', authorize('admin'), updateRoleValidation, validate, updateUserRole);
router.put('/:id/toggle-status', authorize('admin'), toggleUserStatus);

export default router;