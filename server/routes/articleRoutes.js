import express from 'express';
import { body } from 'express-validator';
import {
  createArticle,
  getArticles,
  getArticleById,
  updateArticle,
  submitArticle,
  approveArticle,
  rejectArticle,
  deleteArticle,
  getArticleStats,
  searchArticles
} from '../controllers/articleController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

// Validation rules
const articleValidation = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Title must be between 5 and 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ min: 50 })
    .withMessage('Content must be at least 50 characters long')
];

const submitValidation = [
  body('editorId')
    .notEmpty()
    .withMessage('Editor is required')
    .isMongoId()
    .withMessage('Invalid editor ID')
];

const rejectValidation = [
  body('comment')
    .trim()
    .notEmpty()
    .withMessage('Rejection comment is required')
    .isLength({ min: 10 })
    .withMessage('Comment must be at least 10 characters long')
];

// Public routes (no authentication required)
router.get('/search', searchArticles);

// Protected routes
router.use(protect);

// Article CRUD
router.post('/', authorize('writer'), articleValidation, validate, createArticle);
router.get('/stats', authorize('admin'), getArticleStats);
router.get('/', getArticles); // Protected but role-aware
router.get('/:id', getArticleById);
router.put('/:id', authorize('writer'), articleValidation, validate, updateArticle);
router.delete('/:id', authorize('writer', 'admin'), deleteArticle);

// Article workflow
router.put('/:id/submit', authorize('writer'), submitValidation, validate, submitArticle);
router.put('/:id/approve', authorize('editor'), approveArticle);
router.put('/:id/reject', authorize('editor'), rejectValidation, validate, rejectArticle);

export default router;