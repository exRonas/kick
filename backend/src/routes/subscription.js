import { Router } from 'express';
import { getPrice, subscribeAuthor } from '../controllers/subscriptionController.js';

const router = Router();

router.get('/price', getPrice);
router.post('/author', subscribeAuthor);

export default router;