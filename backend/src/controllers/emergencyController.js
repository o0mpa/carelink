import db from '../config/db.js';
import nodemailer from 'nodemailer';
import twilio from 'twilio';

//email transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS
    }
});

//reverse geocoding → GPS coordinates → human readable address (falls back to raw coordinates if it fails)
const getReadableAddress = async (latitude, longtitude) => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
        const response = await fetch(url, {
            headers: {'User-Agent': 'CareLink Emergency System'}
        });
        const data = await response.json();
        return data.display_name || `${latitude}, ${longtitude}`
    } catch (error) {
        return `${latitude}, ${longitude}`;
    }
};

//trigger emergency alert
// Body: { latitude, longitude }
//
// FRONTEND SETUP — how to get the client's actual location in React:
// navigator.geolocation.getCurrentPosition(
//     (pos) => {
//         const { latitude, longitude } = pos.coords;
//         // then POST { latitude, longitude } to /api/emergency/trigger
//     },
//     (err) => console.error('Location access denied:', err)
// );
export const triggerEmergencyAlert = async (req, res) => {
    try {
        const {latitude, longitude} = req.body;
        const userId = req.user.id;
        if (!latitude || !longitude) {
            return res.status(400).json({message: 'Location (latitude and longtitude) is required.'});
        }
        const [clients] = await db.promise().query(
            `SELECT client_id, full_name, phone_number, email, blood_type, allergies,
            diagnoses, conditions, doctor_facility, medical_specialties_required,
            emergency_contact1_name, emergency_contact1_phone, emergency_contact2_name, emergency_contact2_phone
            FROM client_profiles WHERE user_id = ?`, [userId]
        );
        if (clients.length === 0) return res.status(404).json({ message: 'Client Profile Not Found' });
        const client = clients[0];
        // convert GPS coordinates into a readable address
        const readableAddress = await getReadableAddress(latitude, longitude);
        const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
        //save alert to database - admin panel reads from this table
        await db.promise().query(
            `INSERT INTO emergency_alerts (client_id, latitude, logntitude, readable_address, status)
            VALUES (?, ?, ?, ?, 'Active')`, [client.client_id, latitude, longitude, readableAddress]
        );
        //building a health profile message - alert content
        const allergiesText = Array.isArray(client.allergies) ? client.allergies.join(', ') : (client.allergies || 'None');
        //sending emails to client's own email and admin email
        const emailBody = 
        `🚨 CARELINK EMERGENCY ALERT
        A CareLink client has triggered an emergency alert.
        ━━━━━━━━━━━━━━━━━━━━━━
        PATIENT INFORMATION
        ━━━━━━━━━━━━━━━━━━━━━━
        Name:   ${client.full_name}
        Phone:  ${client.phone_number}
        Email:  ${client.email}
        ━━━━━━━━━━━━━━━━━━━━━━
        HEALTH INFORMATION
        ━━━━━━━━━━━━━━━━━━━━━━
        Blood Type:          ${client.blood_type                      || 'Not specified'}
        Allergies:           ${allergiesText}
        Diagnoses:           ${client.diagnoses                       || 'Not specified'}
        Conditions:          ${client.conditions                      || 'Not specified'}
        Medical Specialties: ${client.medical_specialties_required    || 'Not specified'}
        Doctor / Facility:   ${client.doctor_facility                 || 'Not specified'}
        ━━━━━━━━━━━━━━━━━━━━━━
        LOCATION
        ━━━━━━━━━━━━━━━━━━━━━━
        Address:     ${readableAddress}
        Coordinates: ${latitude}, ${longitude}
        Google Maps: ${mapsLink}
        ━━━━━━━━━━━━━━━━━━━━━━
        EMERGENCY CONTACTS
        ━━━━━━━━━━━━━━━━━━━━━━
        Contact 1: ${client.emergency_contact1_name || 'N/A'} — ${client.emergency_contact1_phone || 'N/A'}
        Contact 2: ${client.emergency_contact2_name || 'N/A'} — ${client.emergency_contact2_phone || 'N/A'}
        This is an automated emergency alert from CareLink.`.trim();
        await transporter.sendMail({
            from: process.env.MAIL_USER,
            to: [client.email, process.env.ADMIN_EMAIL].filter(Boolean).join(', '),
            subject: `🚨 EMERGENCY ALERT — ${client.full_name}`,
            text: emailBody
        });
        //sending SMS to both emergency contacts via Twilio
        const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        const smsBody = 
        `🚨 CARELINK EMERGENCY\n` +
        `Patient: ${client.full_name}\n` +
        `Phone: ${client.phone_number}\n` +
        `Blood Type: ${client.blood_type || 'Unknown'}\n` +
        `Allergies: ${allergiesText}\n` +
        `Location: ${readableAddress}\n` +
        `Maps: ${mapsLink}`;
        const emergencyContacts = [client.emergency_contact1_phone, client.emergency_contact2_phone].filter(Boolean);
        for (const phone of emergencyContacts) {
            // Egyptian numbers: strip leading 0, add +20 country code
            const formattedPhone = '+20' + phone.replace(/^(0|\+20)/, '');
            await twilioClient.messages.create({
                body: smsBody,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: formattedPhone
            });
        }
        res.status(201).json({
            message: 'Emergency alert triggered',
            location: readableAddress,
            mapsLink,
            emailSentTo: [client.email, process.env.ADMIN_EMAIL].filter(Boolean)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//admin resolves an alert
export const resolveAlert = async (req, res) => {
    try {
        const {alertId} = req.params;
        const [result] = await db.promise().query(
            `UPDATE emergency_alerts SET status = 'Resolved' WHERE alert_id = ?`, [alertId] 
        );
        if (result.affectedRows === 0) return res.status(404).json({message: 'Alert Not Found'});
        res.json({ message: 'Alert resolved' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};