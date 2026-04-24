import express from 'express';
const router = express.Router();
import {signupClient, signupCaregiver, signin, logout, getSecurityQuestions, forgotPasswordSecurity} from '../controllers/authController.js';
import {authMiddleware} from '../middleware/authMiddleware.js';
import { upload } from "../middleware/uploads.js";

//signup routes
router.post('/signup-client', upload.fields([
    { name: "national_id", maxCount: 1 },
    { name: "diagnoses", maxCount: 1 },
    { name: "conditions", maxCount: 1 }
    ]),signupClient);

router.post('/signup-caregiver', upload.fields([
    { name: "education_docs", maxCount: 1 },
    { name: "certificates", maxCount: 1 },
    { name: "national_id", maxCount: 1 },
    { name: "criminal_record", maxCount: 1 },
    { name: "references", maxCount: 1 }
    ]), signupCaregiver)

//signin routes
router.post('/signin', authMiddleware(['Client', 'Caregiver', 'Admin']), signin);

//logout
router.post('/logout', authMiddleware(['Client', 'Caregiver']), logout);

// Password recovery
router.get('/security-questions/:username', getSecurityQuestions);
router.post("/forgot-password-security", authMiddleware(['Client', 'Caregiver']), forgotPasswordSecurity);


//verify token route:
router.get('/verify', authMiddleware, (req, res) => {
    res.json({user: req.user});
});

export default router;