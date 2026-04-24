import express from 'express';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { submitReview, getCaregiverReviews, submitReport } from '../controllers/reviewController.js';

const router = express.Router();

//client submits a review after service completion
router.post('/submit', authMiddleware(['Client']), submitReview);

//getting all reviews for a caregiver's profile - no auth needed
router.get('/caregiver/:caregiverId', getCaregiverReviews);

//client reports an issue
router.post('/report', authMiddleware(['Client']), submitReport);

export default router;