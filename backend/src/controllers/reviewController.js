import db from '../config/db.js';

//submitting a review (after a request is completed or paid)
export const submitReview = async (req, res) => {
    try {
        const {requestId, rating, review_text} = req.body;
        const userId = req.user.id;
        //validate rating
        if (!rating || rating < 1 || rating > 5 || !Number.isInteger(Number(rating))) {
            return res.status(400).json({message: 'Rating must be a whole number between 1 and 5.'})
        }
        //resolve client
        const [clients] = await db.promise().query(
            `SELECT client_id FROM client_profiles WHERE user_id = ?`, [userId]
        );
        if (clients.length === 0) return res.status(404).json({message: 'Client Profile Not Found'});
        const clientId = clients[0].client_id;
        //validating request belongs to client and is in a reviewable state
        const [requests] = await db.promise().query(
            `SELECT cr.request_id, cr.status, rc.caregiver_id
            FROM care_requests cr
            JOIN request_caregivers rc ON cr.request_id = rc.request_id AND rc.response = 'Accepted'
            WHERE cr.request_id = ? and cr.client_id = ?`,
            [requestId, clientId]
        );
        if (requests.length === 0) return res.status(404).json({message: 'Request Not Found'});
        const request = requests[0];
        if (!['Completed', 'Paid'].includes(request.status)) {
            return res.status(400).json({message: 'Reviews can only be submitted after a service is completed.'});
        }
        //ensuring one review only is made per request
        const [existing] = await db.promise().query(
            `SELECT review_id FROM reviews WHERE request_id = ? AND client_id = ?`,
            [requestId, clientId]
        );
        if (existing.length > 0) {
            return res.status(400).json({message: 'You have already submitted a review for this request.'});
        }
        //insert a review
        await db.promise().query(
            `INSERT INTO reviews (request_id, client_id, caregiver_id, rating, review_text)
            VALUES (?, ?, ?, ?, ?)`, [requestId, clientId, request.caregiver_id, rating, review_text || null]
        );
        //updating caregiver's average rating
        await db.promise().query(
            `UPDATE caregiver_profiles
            SET average_rating = (
                SELECT ROUND(AVG(rating), 1)
                FROM reviews
                WHERE caregiver_id = ? AND rating IS NOT NULL
            ),
            review_count = (
            SELECT COUNT(*) FROM reviews WHERE caregiver_id = ?
            )
            WHERE caregiver_id = ?`,
            [request.caregiver_id, request.caregiver_id, request.caregiver_id]
        );
        res.status(201).json({message: 'Review Submitted Successfully'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//fetching reviews for a caregiver profile (public display/ no auth needed)
export const getCaregiverReviews = async (req, res) => {
    try {
        const {caregiverId} = request.params;
        const [reviews] = await db.promise().query(
            `SELECT r.review_id, r.rating, r.review_text, r.created_at,
            cp.full_name AS client_name
            FROM reviews r
            JOIN client_profiles cp ON r.client_id = cp.client_id
            WHERE r.caregiver_id = ?
            ORDER BY r.created_at DESC`,
            [caregiverId]
        );
        const [summary] = await db.promise().query(
            `SELECT average_rating, review_count FROM caregiver_profiles WHERE caregiver_id = ?`,
            [caregiverId]
        );
        res.json({
            caregiverId,
            averageRating: summary[0]?.average_rating || 0,
            reviewCount: summary[0]?.review_count || 0,
            reviews
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//submitting a report/issue flagged to admin
export const submitReport = async (req, res) => {
    try {
        const {requestId, issue_text} = req.body;
        const userId = req.user.id;
        if (!issue_text || issue_text.trim().length === 0) {
            return res.status(400).json({message: 'Issue Description Cannot Be Empty'});
        }
        const [clients] = await db.promise().query(
            `SELECT client_id FROM client_profiles WHERE user_id = ?`, [userId]
        );
        if (clients.length === 0) return res.status(404).json({message: 'Client Profile Not Found'});
        const clientId = clients[0].client_id;
        //confirm request exists and belongs to that client
        const [request] = await db.promise().query(
            `SELECT request_id FROM care_requests WHERE request_id = ? and client_id = ?`,
            [requestId, clientId]
        );
        if (requests.length === 0) return res.status(404).json({message: 'Request Not Found'});
        //logging report/complaint
        await db.promise().query(
            `INSERT INTO reports (request_id, client_id, issue_text, status)
            VALUES (?, ?, ?, 'Pending')`,
            [requestId, clientId, issue_text.trim()]
        );
        res.status(201).json({message: 'Report submitted. Our team will look into it.'});
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};