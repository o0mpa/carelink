import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import {
    payUpfront,
    payFinalBalance,
    verifyCharge,
    getPaymentStatus,
    tapWebhook,
} from '../controllers/paymentController.js';

const router = express.Router();

//tap webhook
router.post('/webhook', tapWebhook);

//client paying upfront
router.post('/pay-upfront', authMiddleware(['Client']), payUpfront);

//client paying final balance
router.post('/pay-final', authMiddleware(['Client']), payFinalBalance);

// ── Frontend verifies result after Tap redirects client back ──
//GET /api/payments/verify/:tapChargeId
router.get('/verify/:tapChargeId', authMiddleware(['Client']), verifyCharge);

// ── Get all payment records + remaining balance for a request ──
//GET /api/payments/status/:requestId
router.get('/status/:requestId', authMiddleware(['Client']), getPaymentStatus);

export default router;