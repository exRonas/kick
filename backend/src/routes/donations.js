import { Router } from 'express';
import { body } from 'express-validator';
import { createDonation } from '../controllers/donationController.js';
import { authRequired } from '../middleware/auth.js';

const router = Router({ mergeParams: true });

// POST /api/projects/:id/donations
router.post(
  '/',
  authRequired,
  [body('amount').isFloat({ gt: 0 })],
  createDonation
);

export default router;
