import express from 'express';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { triggerEmergencyAlert, resolveAlert } from '../controllers/emergencyController.js';

const router = express.Router();

//client triggers the one-tap emergency button
router.post('/trigger', authMiddleware(['Client']), triggerEmergencyAlert);

//admin resolves an alert after handling it
router.put('/:alertId/resolve', authMiddleware(['Client']), resolveAlert);

export default router;