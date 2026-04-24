import express from 'express';
import {authMiddleware} from "../middleware/authMiddleware.js";
import {getClientProfile, updateClientProfile, uploadClientPicture, changeClientPassword} from "../controllers/clientController.js";

const router = express.Router();

//fetching client profile
router.get('/profile', authMiddleware(['Client']), getClientProfile);

//client edits profile
router.put('/edit-profile', authMiddleware(['Client']), updateClientProfile);

//client uploads a profile picture
router.post('/upload-picture', authMiddleware(['Client']), uploadClientPicture);


//client changes password
router.put('/change-password', authMiddleware(['Client']), changeClientPassword);

export default router;