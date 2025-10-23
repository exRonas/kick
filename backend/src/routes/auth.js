import { Router } from 'express';
import { body } from 'express-validator';
import { login, register } from '../controllers/authController.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').isString().trim().isLength({ min: 2 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('role').optional().isIn(['donor', 'author', 'admin'])
  ],
  register
);

router.post(
  '/login',
  [body('email').isEmail().normalizeEmail(), body('password').isLength({ min: 6 })],
  login
);

export default router;
