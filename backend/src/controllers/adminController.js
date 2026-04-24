import db from '../config/db.js';

//listing all caregiver profiles
export const getAllCaregivers = async (req, res) => {
    try {
        const {status} = req.query; //optional filter: ?status=Pending
        let query = `SELECT caregiver_id, user_id, full_name, gender, city, area,
        phone_number, email, approval_status, average_rating, review_count,
        created_at FROM caregiver_profiles`;
        const params = [];
        if (status) {
            query += `WHERE approval_status = ?`;
            params.push(status);
        }
        query += `ORDER BY created_at DESC`;
        const [caregivers] = await db.promise().query(query, params);
        res.json({caregivers});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//fetching a caregiver's full profile + documents for review
export const getCaregiverDetails = async (req, res) => {
    try {
        const {caregiverId} = req.params;
        const [rows] = await db.promise().query(
            `SELECT * FROM caregiver_profiles WHERE caregiver_id = ?`, [caregiverId]
        );
        if (rows.length === 0) return res.status(404).json({message: 'Caregiver Profile Not Found'});
        res.json({caregiver: rows[0]});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//approving - rejecting a caregiver
export const reviewCaregiverApplication = async (req, res) => {
    try {
        const {caregiverId} = req.params;
        const {action} = req.body;
        if (!['Approve', 'Reject'].includes(action)) {
            return res.status(400).json({message: 'Action must be "Approve" or "Reject".'});
        }
        const newStatus = action === 'Approve' ? 'Active' : 'Rejected';
        const [result] = await db.promise().query(
            `UPDATE caregiver_profiles SET approval_status = ? WHERE caregiver_id = ?`,
            [newStatus, caregiverId]
        );
        if (result.affectedRows === 0) return res.status(404).json({message: 'Caregiver Profile Not Found'});
        res.json({message: `Caregiver account ${newStatus.toLowerCase()}`});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//listing all client profiles
export const getAllClients = async (req, res) => {
    try {
        const [clients] = await db.promise().query(
            `SELECT client_id, user_id, full_name, gender, city, area,
            phone_number, email, created_at
            FROM client_profiles
            ORDER BY created_at DESC`
        );
        res.json({clients});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//list requests filtered by status 
export const getRequestsByStatus = async (req, res) => {
    try {
        const {status} = req.query;
        const allowed = ['Pending', 'Accepted', 'Declined', 'Completed', 'Paid'];
        if (!status || !allowed.includes(status)) {
            return res.status(400).json({message: `Status must be one of : ${allowed.join(',')}`});
        }
        const [requests] = await db.promise().query(
            `SELECT cr.request_id, cr.care_category, cr.service_type, cr.day_category, cr.start_date, cr.end_date, cr.status, cr.city, cr.area,
            cr.min_compensation, cr.max_compensation, cp_client.full_name AS client_name, cp_client.phone_number AS client_phone,
            cp_cg.full_name AS caregiver_name, cp_cg.phone_number AS caregiver_phone
            FROM care_requests cr
            JOIN client_profiles cp_client ON cr.client_id = cp_client.client_id
            LEFT JOIN request_caregivers rc ON cr.request_id = rc.request_id AND rc.response  = 'Accepted'
            LEFT JOIN caregiver_profiles cp_cg ON rc.caregiver_id = cp_cg.caregiver_id
            WHERE cr.status = ?
            ORDER BY cr.start_date DESC`, [status]
        );
        res.json({status, requests});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//listing all flagged reports from clients
export const getReports = async (req, res) => {
    try {
        const [reports] = await db.promise().query(
            `SELECT r.report_id, r.issue_text, r.status, r.created_at,
            cr.request_id, cr.care_category, cr.start_date, cr.end_date,
            cp.full_name AS client_name, cp.phone_number AS client_phone, cp.email AS client_email,
            FROM reports r
            JOIN care_requests cr ON r.request_id = cr.request_id
            JOIN client_profiles cp ON r.client_id = cp.client_id
            ORDER BY r.created_at DESC`
        );
        res.json({reports});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//update report status (reviewed/ resolved)
export const updateReportStatus = async (req, res) => {
    try {
        const {reportId} = req.params;
        const {status} = req.body;
        if(!['Reviewed', 'Resolved'].includes(status)) {
            return res.status(400).json({message: 'Status must be "Reviewed" or "Resolved".'});
        }
        const [result] = await db.promise().query(
            `UPDATE reports SET status = ? WHERE report_id = ?`, [status, reportId]
        );
        if (result.affectedRows === 0) return res.status(404).json({message: 'Report Not Found'});
        res.json({message: `Report marked as ${status}`})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//listing all emergency alerts
export const getEmergencyAlerts = async (req, res) => {
    try {
        const [alerts] = await db.promise().query(
            `SELECT ea.alert_id, ea.latitude, ea.longtitude, ea.created_at,
            ea.status, cp.full_name, cp.phone_number, cp.email, cp.blood_type,
            cp.allergies, cp.diagnoses, cp.conditions, cp.doctor_facility, cp.medical_specialties_required,
            cp.emergency_contact1_name, cp.emergency_contact1_phone, cp.emergency_contact2_name, cp.emergency_contact2_phone
            FROM emergency_alerts ea
            JOIN client_profiles cp ON ea_client_id = cp.client_id
            ORDER BY ea.created_at DESC`
        );
        res.json({alerts});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};