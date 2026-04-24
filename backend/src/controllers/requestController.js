import db from '../config/db.js';

//generate every date between start date and end date of the service
const getDatesInRange = (startDate, endDate) => {
    const dates = [];
    const current = new Date(startDate);
    const end = new Date(endDate);
    while (current <= end) {
        dates.push(current.toISOString().split('T')[0]);
        current.setDate(current.getDate() + 1);
    }
    return dates;
}

//client creating a new caregiving request
export const createRequest = async (req, res) => {
    try {
        const {service_type, day_category, gender_preference, min_compensation, max_compensation, start_date, 
            end_date, care_category, skills_needed, medical_specialties_needed} = req.body;
        const userId = req.user.id; //extract user id from the token
        // Resolve client_id and location from client_profiles
        const [clients] = await db.promise().query(
            `SELECT client_id, city, area, skills_needed FROM client_profiles WHERE user_id = ?`, [userId]);
        if (clients.length === 0) return res.status(404).json({message: 'Client Profile Not Found'});
        const {client_id, city, area} = clients[0];
        //if no skills are selected, fall back on the client profile skills needed
        let finalSkills = skills_needed;
        if (!skills_needed || skills_needed.length === 0) {
            finalSkills = clients[0].skills_needed || [];
        }
        //insert request into care_requests table
        const [result] = await db.promise().query(
            `INSERT INTO care_requests (client_id, service_type, day_category, gender_preference, min_compensation, max_compensation, 
            start_date, end_date, care_category, skills_needed, medical_specialties_needed, city, area, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`,
            [client_id, service_type, day_category, gender_preference, min_compensation, max_compensation, start_date, end_date,
                care_category, JSON.stringify(finalSkills), medical_specialties_needed, city, area]
        );
        res.status(201).json({message: 'Request Created', requestId: result.insertId});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//matching algorithm
export const matchCaregivers = async (req, res) => {
    try {
        const {requestId} = req.params;
        const [requests] = await db.promise().query(
            `SELECT * FROM care_requests WHERE request_id = ?`, [requestId]
        );
        if (requests.length === 0) return res.status(404).json({message: 'Request Not Found'});
        const request = requests[0];
        // matching the caregivers by city, skills, gender, compensation, and availability
        // creating an alias cp for caregiver_profiles for shorter queries
        // creating an alias cb for caregiver_bookings for shorter queries
        const [caregivers] = await db.promise().query(
            `SELECT * FROM caregiver_profiles cp WHERE cp.city = ?
            AND JSON_OVERLAPS(cp.skills, ?)
            AND cp.gender = ?
            AND CASE
                WHEN ? = 'A' THEN cp.day_rate_a BETWEEN ? AND ?
                WHEN ? = 'B' THEN cp.day_rate_b BETWEEN ? AND ?
                WHEN ? = 'C' THEN cp.day_rate_c BETWEEN ? AND ?
                WHEN ? = 'D' THEN cp.day_rate_d BETWEEN ? AND ?
                END
            AND cp.approval_status = 'Active'
            AND NOT EXISTS (SELECT 1 FROM caregiver_bookings cb WHERE cb.caregiver_id = cp.caregiver_id 
            AND cb.booked_date BETWEEN ? AND ?`,
            [request.city, JSON.stringify(request.skills_needed), request.gender_preference, request.day_category, 
                request.min_compensation, request.max_compensation,
                request.day_category, request.min_compensation, request.max_compensation,
                request.day_category, request.min_compensation, request.max_compensation,
                request.day_category, request.min_compensation, request.max_compensation,
                request.start_date, request.end_date
            ]
        );

        if (caregivers.length > 0) {
            const values = caregivers.map(cg => [requestId, cg.caregiver_id]);
            await db.promise().query(
                `INSERT IGNORE INTO request_caregivers (request_id, caregiver_id) VALUES ?`, [values]
            );
        }

        res.json({request, caregivers});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//caregiver view incoming requests returns only the pending requests that this caregiver was matched to and hasn't yet responded to
//an accepted requests is filtered out from everyone else's view
export const getIncomingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const [caregivers] = await db.promise().query(
            `SELECT caregiver_id FROM caregiver_profiles WHERE user_id = ?`, [userId]
        );
        if (caregivers.length === 0) return res.status(404).json({message: 'Caregiver Profile Not Found'});
        const caregiverId = caregivers[0].caregiver_id;
        //logic: 
        //cr.status = 'Pending'   → only show requests not yet accepted by anyone
        //rc.response IS NULL     → only show requests this caregiver hasn't responded to yet
        //Once ONE caregiver accepts → cr.status becomes 'Accepted'
        const [requests] = await db.promise().query(
            `SELECT cr.request_id, cr.service_type, cr.day_category,
            cr.min_compensation, cr.max_compensation, cr.start_date,
            cr.end_date, cr.care_category, cr.skills_needed, 
            cr.medical_specialties_needed, cr.city, cr.area, cr.status,
            cp.full_name AS client_name, cp.age, cp.gender
            FROM care_requests cr
            JOIN request_caregivers rc ON cr.request_id  = rc.request_id
            JOIN client_profiles cp ON cr.client_id   = cp.client_id
            WHERE rc.caregiver_id = ?
            AND cr.status = 'Pending'
            AND rc.response IS NULL
            ORDER BY cr.start_date ASC`, [caregiverId]
        );

        res.json({caregiverId, requests})
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//caregiver accepting a request
// FLOW:
// 1. Verify caregiver was matched to this request.
// 2. Verify request is still Pending — if another caregiver already accepted
// → gets a clear "no longer available" message.
// 3. Mark this caregiver's response as Accepted in request_caregivers.
// 4. Set care_requests.status = 'Accepted' → request disappears from all other caregivers' lists.
// 5. Insert one booking row per service day → dims those days on the calendar.

export const acceptRequest = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user.id;
        //resolve caregiver_id from user_id
        const [caregivers] = await db.promise().query(
            `SELECT caregiver_id FROM caregiver_profiles WHERE user_id = ?`, [userId]
        );
        if (caregivers.length === 0) return res.status(404).json({ message: 'Caregiver profile not found' });
        const caregiverId = caregivers[0].caregiver_id;
        //confirm caregiver was matched to this request
        const [match] = await db.promise().query(
            `SELECT id, response FROM request_caregivers WHERE request_id = ? AND caregiver_id = ?`,
            [requestId, caregiverId]
        );
        if (match .length === 0) {
            return res.status(403).json({message: 'You Were Not Matched To This Request'});
        }
        if (match[0].response === 'Accepted') {
            return res.status(400).json({message: 'You Have Already Accepted This Request'});
        }

        //confirm the request is still pending and no other caregiver has accepted this request
        const [requestRows] = await db.promise().query(
            `SELECT status, start_date, end_date FROM care_requests WHERE request_id = ?`,
            [requestId]
        );
        if (requestRows.length === 0) return res.status(404).json({message: 'Request Not Found'});
        if (requestRows[0].status !== 'Pending') {
            return res.status(400).json({message: `This Request Is No Longer Available - It Has Been ${requestRows[0].status}`});
        }

        //mark this caregiver's response
        await db.promise().query(
            `UPDATE care_requests SET status = 'Accepted' WHERE request_id = ?`,
            [requestId]
        );
        await db.promise().query(
            `UPDATE request_caregivers SET response = 'Accepted', responded_at = NOW()
            WHERE request_id = ? AND caregiver_id = ?`, [requestId, caregiverId]
        );

        //insert booking into caregiver_bookings to block service duration (one booking row per day)
        const bookedDates = getDatesInRange(requestRows[0].start_date, requestRows[0].end_date);
        const bookingRows = bookedDates.map(date => [caregiverId, requestId, date]);
        await db.promise().query(
            `INSERT IGNORE INTO caregiver_bookings (caregiver_id, request_id, booked_date) VALUES ?`,
            [bookingRows]
        );

        res.status(201).json({message: 'Request Accepted', bookedDates});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//caregiver declining a request
// FLOW:
// 1. Mark this caregiver's response as Declined.
// 2. Check if ALL caregivers matched to this request have now declined.
// 3. Only if ALL declined → set care_requests.status = 'Declined'.
//    If even one caregiver hasn't responded yet → request stays Pending and remains visible to the others.

export const declineRequest = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user.id;
        const [caregivers] = await db.promise().query(
            `SELECT caregiver_id FROM caregiver_profiles WHERE user_id = ?`, [userId]
        );
        if (caregivers.length === 0) return res.status(404).json({message: 'Caregiver Profile Not Found'});
        const caregiverId = caregivers[0].caregiver_id;
        
        //confirm this caregiver was matched to this request
        const [match] = await db.promise().query(
            `SELECT id, response FROM request_caregivers WHERE request_id = ? AND caregiver_id = ?`,
            [requestId, caregiverId]
        );
        if (match.length === 0) {
            return res.status(403).json({ message: 'You were not matched to this request' });
        }

        //allow declining a pending request only 
        const [requestRows] = await db.promise().query(
            `SELECT status FROM care_requests WHERE request_id = ?`,
            [requestId]
        );
        if (requestRows.length === 0) return res.status(404).json({message: 'Request Not Found'});
        if (requestRows[0].status !== 'Pending') {
            return res.status(400).json({message: `Request Cannot Be Declined - Current Status: ${requestRows[0].status}`});
        }

        //mark the caregivers's response as declined
        await db.promise().query(
            `UPDATE request_caregivers SET response = 'Declined', responded_at = NOW()
            WHERE request_id = ? AND caregiver_id = ?`, [requestId, caregiverId]
        );

        // Count total matched caregivers vs how many have declined
        // response IS NULL  → hasn't responded yet (still waiting)
        // response = 'Declined' → declined
        // response = 'Accepted' → accepted (shouldn't happen here since status was Pending, but guarded against in the status check above
        const [counts] = await db.promise().query(
            `SELECT COUNT(*) AS total,
            SUM (CASE WHEN response = 'Declined' THEN 1 ELSE 0 END) AS declined_count,
            SUM (CASE WHEN response IS NULL THEN 1 ELSE 0 END) AS pending_count
            FROM request_caregivers WHERE request_id = ?`, [requestId]
        );
        const allDeclined = parseInt(counts[0].total) === parseInt(counts[0].declined_count);
        if (allDeclined) {
            //all matched caregivers declined the request → the request is marked as declined
            await db.promise().query(
                `UPDATE care_requests SET status = 'Declined' WHERE request_id = ?`, [requestId]
            );
        }

        res.json({
            message: allDeclined  
            ? 'Request Declined By All Caregivers' 
            : `Request Declined - ${counts[0].pending_count} Caregiver(s) Still Pending`, 
            allDeclined
        });

    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//caregiver availability calendar
export const getCaregiverAvailability= async (req, res) => {
    try {
        const {caregiverId} = req.params;
        const [bookings] = await db.promise().query(
            `SELECT booked_date FROM caregiver_bookings WHERE caregiver_id = ? ORDER BY booked_date ASC`, [caregiverId]
        );
        res.json({caregiverId, bookedDates: bookings.map(b => b.booked_date)});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//client views their current requests
export const getCurrentRequest = async (req, res) => {
    try {
        const userId = req.user.id;
        const [clients] = await db.promise().query(
            `SELECT client_id FROM client_profiles WHERE user_id = ?`, [userId]
        );
        if (clients.length === 0) return res.status(404).json({message: 'Client Profile Not Found'});
        const clientId = clients[0].client_id;
        const [requests] = await db.promise().query(
            `SELECT cr.request_id, cr.care_category, cr.service_type, cr.day_category,
            cr.min_compensation, cr.max_compensation, cr.start_date, cr.end_date,
            cr.skills_needed, cr.city, cr.area, cr.status, rc.caregiver_id,
            cp.full_name AS caregiver_name, cp.phone_number AS caregiver_phone,
            cp.email AS caregiver_email, cp.user_id AS caregiver_user_id,
            cp.profile_picture AS caregiver_picture
            FROM care_requests cr
            LEFT JOIN request_caregivers rc ON cr.request_id = rc.request_id AND rc.response = 'Accepted'
            LEFT JOIN caregiver_profiles cp ON rc.caregiver_id = cp.caregiver_id
            WHERE cr.client_id = ?
            AND cr.status IN ('Pending', 'Accepted', 'Declined', 'Completed')
            ORDER BY cr.request_id DESC
            LIMIT 1`, [clientId]
        );
        if (requests.length === 0) return res.status(404).json({message: 'No Active Requests Found'});
        res.json({requests: requests[0]});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//client views their past requests (completed/paid)
export const getClientRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        //resolve client_id from user_id
        const [clients] = await db.promise().query(`SELECT client_id FROM client_profiles WHERE user_id = ?`, [userId]);
        if (clients.length === 0) return res.status(404).json({message: 'Client Profile Not Found'});
        const clientId = clients[0].client_id;
        //fetch requests and caregiver responses "create an alias cr for care_requests table and cb for caregiver_bookings"
        const [requests] = await db.promise().query(
            `SELECT cr.request_id, cr.care_category, cr.skills_needed, cr.city, cr.area, cr.start_date, cr.end_date, cr.status,
            cr.min_compensation, cr.max_compensation, rc.caregiver_id,
            cp.full_name AS caregiver_name,
            cp.phone_number AS caregiver_phone,
            cp.email AS caregiver_email,
            cp.user_id AS caregiver_user_id
            FROM care_requests cr
            LEFT JOIN request_caregivers rc ON cr.request_id = rc.request_id AND rc.response = 'Accepted'
            LEFT JOIN caregiver_profiles cp ON rc.caregiver_id = cp.caregiver_id
            WHERE cr.client_id = ?
            AND cr.status IN ('Completed', 'Paid')
            ORDER BY cr.end_date DESC`, [clientId]
        );
        res.json({clientId, requests});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//mark a service as completed
export const markServiceCompleted = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user.id;
        const [clients] = await db.promise().query(
            `SELECT client_id FROM client_profiles WHERE user_id = ?`, [userId]
        );
        if (clients.length === 0) return res.status(404).json({message: 'Client Profile Not Found'});
        const [result] = await db.promise().query(
            `UPDATE care_requests SET status = 'Completed'
            WHERE request_id = ? AND client_id = ? AND status = 'Accepted' AND end_date <= CURDATE()`,
            [requestId, clients[0].client_id]
        );
        if (result.affectedRows === 0) {
            return res.status(400).json({message: 'Cannot Mark Request As Completed - Request Not Found, Not Accepted, Or Service Has Not Ended Yet'});
        }
        res.json({message: 'Service Marked As Completed. Final Payment Is Now Available.'});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

//caregiver view incoming requests
export const getRequestDetailsForCaregiver = async (req, res) => {
  try {
    const { requestId } = req.params;
    const [requests] = await db.promise().query(
      `SELECT cr.request_id, cr.service_type, cr.day_category, cr.gender_preference,
              cr.min_compensation, cr.max_compensation, cr.start_date, cr.end_date,
              cr.care_category, cr.skills_needed, cr.medical_specialties_needed,
              cr.city, cr.area, cr.status,
              cp.client_id, cp.full_name AS client_name, cp.age, cp.gender, cp.city AS client_city, cp.area AS client_area
       FROM care_requests cr
       JOIN client_profiles cp ON cr.client_id = cp.client_id
       WHERE cr.request_id = ?`,
      [requestId]
    );
    if (requests.length === 0) return res.status(404).json({ message: 'Request Not Found' });
    res.json({ request: requests[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//verify chat eligibility 'chat is only available after a request is accepted and is available to both the client and the caregiver'
export const verifyChatAccess = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user.id;
        const role = req.user.role;
        //confirm the request is accepted
        const [requests] = await db.promise().query(
            `SELECT cr.request_id, cr.status, cr.client_id, 
            cb.caregiver_id, cp_client.user_id AS client_user_id, cp_caregiver.user_id AS caregiver_user_id
            FROM care_requests cr
            LEFT JOIN caregiver_bookings cb ON cr.request_id = cb.request_id
            LEFT JOIN client_profiles cp_client ON cr.client_id = cp_client.client_id
            LEFT JOIN caregiver_profiles cp_caregiver ON cb.caregiver_id = cp_caregiver.caregiver_id
            WHERE cr.request_id = ?`, [requestId]
        );
        if (requests.length === 0) return res.status(404).json({message: 'Request Not Found'});
        const request = requests[0];
        if (!['Accepted', 'Completed', 'Paid'].includes(request.status)) {
            return res.status(403).json({message: 'Chat Is Only Available After A Request Is Accepted'});
        }
        //confirm the requesting user is actually a part of this booking 
        const isClient = role === 'Client' && request.client_user_id === userId;
        const isCaregiver = role === 'Caregiver' && request.caregiver_user_id ===userId;
        if (!isClient && !isCaregiver) {
            return res.status(403).json({message: 'You Are Not Part Of This Request'});
        }
        //return the other party's userId so the frontend knows who to address messages to
        const otherUserId = isClient ? request.caregiver_user_id : request.client_user_id;
        res.json({allowed: true, requestId, otherUserId});
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};