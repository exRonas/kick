import { Router } from 'express';
import { body } from 'express-validator';
import { authRequired, requireRole } from '../middleware/auth.js';
import { dashboard, listProjects, getProject, updateProject, listUsers, updateUser, listDonations, getConfig, updateConfig, deleteProjectAdmin, restoreProjectAdmin, purgeOldTrashed } from '../controllers/adminController.js';

const router = Router();

router.use(authRequired, requireRole('admin'));

router.get('/dashboard', dashboard);

// Projects
router.get('/projects', listProjects);
router.get('/projects/:id', getProject);
router.patch('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProjectAdmin);
router.post('/projects/:id/restore', restoreProjectAdmin);

// Users
router.get('/users', listUsers);
router.patch('/users/:id', updateUser);

// Donations
router.get('/donations', listDonations);

// Config
router.get('/config', getConfig);
router.patch('/config', updateConfig);
router.post('/projects/purge-trashed', purgeOldTrashed);

export default router;
