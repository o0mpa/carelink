import multer from 'multer';
import db from '../config/db.js'
import bcrypt from 'bcryptjs';

//fetching client profile
export const getClientProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const [rows] = await db.promise().query(
            `SELECT cp.*, u.username
            FROM client_profiles cp
            JOIN users u ON cp.user_id = u.user_id
            WHERE cp.user_id = ?`, [userId]
        );
        if (rows.length === 0) return res.status(404).json({message: 'Profile Not Found'});
        res.json({profile: rows[0]});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//profile update
export const updateClientProfile = async (req, res) => {
    try {
        const {id} = req.user;
        const updates = req.body;
        //whitelist allowed fields
        const allowedFields = [
            'full_name', 'city', 'area', 'full_address', 'phone_number', 'email',
            'diagnoses', 'conditions', 'allergies', 'blood_type', 'doctor_facility', 'medical_specialties_required',
            'skills_needed', 'emergency_contact1_name', 'emergency_contact1_phone', 
            'emergency_contact2_name', 'emergency_contact2_phone', 'profile_picture'];
        //filter updates
        const fields = Object.keys(updates).filter(f => allowedFields.includes(f));
        if (fields.length === 0) {
            return res.status(400).json({message: 'No Valid Fields To Update'});
        }
        //build set clause
        const setClause = fields.map(f => `${f} = ?`).join(', ');
        const values = fields.map(f => updates[f]);
        //execute query
        await db.promise().query(
            `UPDATE client_profiles SET ${setClause} WHERE user_id = ?`, [...values, id]
        );
        res.status(200).json({message: 'Client Profile Updated Successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//profile picture upload
const upload = multer({dest: 'uploads/'})
export const uploadClientPicture = [
    upload.single('picture'),
    async (req, res) => {
        try {
            const {id} = req.user;
            await db.promise().query(`UPDATE client_profiles SET profile_picture = ? WHERE user_id = ?`, [req.file.path, id]);
            res.status(200).json({message: 'Profile Picture Set Successfully', path: req.file.path});
        } catch (error) {
            res.status(500).json({error: error.message});
        }
    }
];

//change password
export const changeClientPassword = async (req, res) => {
    try {
        const {id} = req.user;
        const {oldPassword, newPassword} = req.body;
        //fetch current password hash
        const [rows] = await db.promise().query(`SELECT password from users WHERE user_id = ?`, [id]);
        if (rows.length === 0) return res.status(404).json({message: 'Error Fetching User Data'});
        const user = rows[0];
        //verify and compare old password
        const valid = await bcrypt.compare(oldPassword, user.password);
        if (!valid) return res.status(401).json({message: 'Old Password Incorrect'});
        //hash new password
        const hashedNew = await bcrypt.hash(newPassword, 10);
        //update users table
        await db.promise().query(`UPDATE users SET password = ? WHERE user_id = ?`, [hashedNew, id]);
        res.json({message: 'Password Updated Successfully'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};