import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { getAllCaregivers,
    getCaregiverDetails,
    reviewCaregiverApplication,
    getAllClients,
    getRequestsByStatus,
    getReports,
    updateReportStatus,
    getEmergencyAlerts
 } from '../controllers/adminController.js';

const router = express.Router();

//all admin routes are protected - need authentication
//fetching caregiver profiles + reviewing applications
router.get('/caregivers', authMiddleware(['Admin']), getAllCaregivers);
router.get('/caregivers/:caregiverId', authMiddleware(['Admin']), getCaregiverDetails);
router.put('/caregivers/:caregiverId/review', authMiddleware(['Admin']), reviewCaregiverApplication);

//fetching client profiles
router.get('/clients', authMiddleware(['Admin']), getAllClients);

//fetching requests by status
router.get('/requests', authMiddleware(['Admin']), getRequestsByStatus);

//fetching client reports
router.get('/reports', authMiddleware(['Admin']), getReports);
router.put('/reports/:reportId', authMiddleware(['Admin']), updateReportStatus);

//emergency alerts
router.get('/emergency-alerts', authMiddleware(['Admin']), getEmergencyAlerts);

export default router;
