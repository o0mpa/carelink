import multer from "multer";
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dest = req.baseUrl.includes('caregiver')
    //route caregiver and client files to separate folders
    ? 'uploads/caregivers'
    : 'uploads/clients';
    cb(null, dest);
  },
  filename: (req, file, cb) => {
    //sanitize filename and remove spaces to avoid path issues
    const sanitized = file.originalname.replace(/\s+/g, '_');
    cb(null, Date.now() + '-' + sanitized);
  }
});

export const upload = multer({ storage });
