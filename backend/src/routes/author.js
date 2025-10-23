import { Router } from 'express';
import { body } from 'express-validator';
import { authRequired, requireRole, requireActiveSubscription } from '../middleware/auth.js';
import { myProjects, createProject, updateProject, addUpdate, listUpdates, projectStats, deleteProject, listTrashed, restoreProject, purgeMyTrash } from '../controllers/authorController.js';

const router = Router();

// Все роуты автора — под защитой
router.use(authRequired, requireRole('author', 'admin'), requireActiveSubscription);

router.get('/projects', myProjects);
router.post(
  '/projects',
  [
    body('title').isString().isLength({ min: 3 }),
    body('shortDescription').isString().isLength({ min: 5 }),
    body('description').isString().isLength({ min: 10 }),
    body('category').isString().isLength({ min: 2 }),
    body('goalAmount').isFloat({ gt: 0 })
  ],
  createProject
);
router.put(
  '/projects/:id',
  [
    body('title').optional().isString().isLength({ min: 3 }),
    body('shortDescription').optional().isString().isLength({ min: 5 }),
    body('description').optional().isString().isLength({ min: 10 }),
    body('category').optional().isString().isLength({ min: 2 }),
    body('goalAmount').optional().isFloat({ gt: 0 })
  ],
  updateProject
);
router.delete('/projects/:id', deleteProject);
router.get('/projects/trashed/list', listTrashed);
router.post('/projects/:id/restore', restoreProject);
router.post('/trash/purge', purgeMyTrash);

router.post('/projects/:id/updates', [body('content').isString().isLength({ min: 3 })], addUpdate);
router.get('/projects/:id/updates', listUpdates);
router.get('/projects/:id/stats', projectStats);

export default router;
