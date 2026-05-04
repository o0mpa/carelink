import express from 'express';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { 
    createRequest, matchCaregivers, getIncomingRequests, acceptRequest, declineRequest,
    getCaregiverAvailability, getClientRequests, getRequestDetailsForCaregiver, markServiceCompleted,
    verifyChatAccess, getCurrentRequest, getCaregiverCurrentRequest
} from '../controllers/requestController.js';

const router = express.Router();

//client creates a request
router.post('/', authMiddleware(['Client']), createRequest);

//system matches caregivers to a request
router.get('/:requestId/match', authMiddleware(['Client']), matchCaregivers);

//caregiver views their incoming pending requests
router.get('/caregivers/incoming', authMiddleware(['Caregiver']), getIncomingRequests);

//caregiver views their current request/service
router.get('/caregivers/current-request', authMiddleware(['Caregiver']), getCaregiverCurrentRequest);

//caregiver accepts a request
router.post('/:requestId/accept', authMiddleware(['Caregiver']), acceptRequest);

//caregiver declines a request
router.post('/:requestId/decline', authMiddleware(['Caregiver']), declineRequest);

//caregiver views their availability calendar
router.get('/caregivers/:caregiverId/availability', authMiddleware(['Caregiver']), getCaregiverAvailability);

//caregiver views incoming requests details
router.get('/:requestId/details', authMiddleware(['Caregiver']), getRequestDetailsForCaregiver);

//client views their current request
router.get('/clients/current-request', authMiddleware(['Client']), getCurrentRequest);

//client views requests made before
router.get('/clients/requests', authMiddleware(['Client']), getClientRequests);

//marking a service as completed fallback
router.post('/:requestId/complete', authMiddleware(['Admin']), markServiceCompleted);

//verifying chat access before a chat window is opened
router.get('/:requestId/chat-access', authMiddleware(['Client', 'Caregiver']), verifyChatAccess);

export default router;