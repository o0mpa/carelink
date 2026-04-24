import db from '../config/db.js';

//adding a calendar entry (available for both client and caregiver in an active request)
//two entry types: medication - medical appointment
export const addcalendarEntry = async (req, res) => {
    try {
        const {requestId, entry_type, title, description, scheduled_at} = req.body;
        const userId = req.user.id;
        const role = req.user.role;
        if (!['Appointment', 'Medication'].includes(entry_type)) {
            return res.status(400).json({message: 'Entry type must be "Appointment" or "Medication".'});
        }
        if (!title || !scheduled_at) {
            return res.status(400).json({message: 'Title and scheduled time are required.'});
        }
        //verify the user is part of this request and request is active
        const [rows] = await db.promise().query(
            `SELECT cr.request_id, cr.start_date, cr.end_date, cr.status,
            cp_client.user_id AS client_user_id, cp_cg.user_id AS caregiver_user_id,
            FROM care_requests cr
            LEFT JOIN request_caregivers rc ON cr.request_id = rc.request_id AND rc.response = 'Accepted'
            LEFT JOIN client_profiles cp_client ON cr.client_id = cp_client.client_id
            LEFT JOIN caregiver_profiles cp_cg ON rc.caregiver_id = cp_cg.caregiver_id
            WHERE cr.request_id = ?`, [requestId]
        );
        if (rows.length === 0) return res.status(404).json({message: 'Request Not Found'});
        const request = rows[0];
        if (request.status !== 'Accepted') {
            return res.status(403).json({message: 'Calendar only available for active ongoing requests.'});
        }
        const isClient = role === 'Client' && request.client_user_id === userId;
        const isCaregiver = role === 'Caregiver' && request.caregiver_user_id === userId;
        if (!isClient && !isCaregiver) {
            return res.status(403).json({message: 'You are not part of this request.'});
        }
        //validate scheduled_at falls within service duration
        const scheduledDate = new Date(scheduled_at);
        const startDate = new Date(request.start_date);
        const endDate = new Date(request.end_date);
        if (scheduledDate < startDate || scheduledDate > endDate) {
            return res.status(400).json({message: `Scheduled time must be within the service duration (${request.start_date} to ${request.end_date})`});
        }
        await db.promise().query(
            `INSERT INTO calendar_entries (request_id, creator_user_id, entry_type, title, description, scheduled_at)
            VALUES (?, ?, ?, ?, ?, ?)`, [requestId, userId, entry_type, title, description || null, scheduled_at]
        );
        res.status(201).json({message: 'Calendar entry added successfully.'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//get all calendar entries for a request (available for both client and caregiver)
export const getCalendarEntries = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user.id;
        const role = req.user.role;
        //verify user is part of this request
        const [rows] = await db.promise().query(
            `SELECT cr.request_id, cr.status, cp_client.user_id AS client_user_id,
            cp_cg.user_id AS caregiver_user_id
            FROM care_requests cr
            LEFT JOIN request_caregivers rc ON cr.request_id = rc.request_id AND rc.response = 'Accepted'
            LEFT JOIN client_profiles cp_client ON cr.client_id = cp_client.client_id
            LEFT JOIN caregiver_profiles cp_cg ON rc.caregiver_id = cp_cg.caregiver_id
            WHERE cr.request_id = ?`, [requestId]
        );
        if (rows.length === 0) return res.status(404).json({message: 'Request Not Found'});
        const request = rows[0];
        const isClient = role === 'Client' && request.client_user_id === userId;
        const isCaregiver = role === 'Caregiver' && request.caregiver_user_id === userId;
        if (!isClient && !isCaregiver) {
            return res.status(403).json({message: 'You are not part of this request.'});
        }
        if (request.status !== 'Accepted') {
            return res.status(403).json({message: 'Calendar only available for active ongoing requests.'});
        }
        const [entries] = await db.promise().query(
            `SELECT cr.entry_id, ce.entry_type, ce.title, ce.description,
            ce.scheduled_at, ce.created_by, u.username AS created_by
            FROM calendar_entries ce
            JOIN users u ON ce.creator_user_id = u.user_id
            WHERE ce.request_id = ?
            ORDER BY ce.scheduled_at ASC`, [requestId]
        );
        res.json({requestId, entries});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//delete a calendar entry (only the creating user could)
export const deleteCalendarEntry = async (req, res) => {
    try {
        const {entryId} = req.params;
        const userId = req.user.id;
        const [result] = await db.promise().query(
            `DELETE FROM calendar_entries
            WHERE entry_id = ? AND creator_user_id = ?`, [entryId, userId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'Entry not found or you did not create it.'});
        }
        res.json({message: 'Calendar Entry Deleted'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};