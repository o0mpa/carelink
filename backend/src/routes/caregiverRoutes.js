import express from 'express'
import {authMiddleware} from "../middleware/authMiddleware.js";
import {getCaregiverProfile, updateCaregiverProfile, uploadCaregiverPicture, changeCaregiverPassword} from "../controllers/caregiverController.js"

const router = express.Router();

//fetching caregiver profile
router.get('/profile', authMiddleware(['Caregiver']), getCaregiverProfile);

//caregiver edits profile
router.put('/edit-profile', authMiddleware(['Caregiver']), updateCaregiverProfile);

//caregiver uploads a profile picture
router.post('/upload-picture', authMiddleware(['Caregiver']), uploadCaregiverPicture);


//caregiver changes password
router.put('/change-password', authMiddleware(['Caregiver']), changeCaregiverPassword);

export default router;