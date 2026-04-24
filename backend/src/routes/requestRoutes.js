import express from 'express';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { 
    createRequest, matchCaregivers, getIncomingRequests, acceptRequest, declineRequest,
    getCaregiverAvailability, getClientRequests, getRequestDetailsForCaregiver, markServiceCompleted,
    verifyChatAccess, getCurrentRequest
} from '../controllers/requestController.js';

const router = express.Router();

//client creates a request
router.post('/', authMiddleware(['Client']), createRequest);

//system matches caregivers to a request
router.get('/:requestId/match', authMiddleware(['Client']), matchCaregivers);

//caregiver views their incoming pending requests
router.get('/caregivers/incoming', authMiddleware(['Caregiver']), getIncomingRequests);

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

//marking a service as completed
router.post('/:requestId/complete', authMiddleware(['Client']), markServiceCompleted);

//verifying chat access before a chat window is opened
router.get('/:requestId/chat-access', authMiddleware(['Caregiver', 'Caregiver']), verifyChatAccess);

export default router;