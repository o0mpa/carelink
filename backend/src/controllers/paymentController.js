import db from '../config/db.js';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

const TAP_API_BASE = 'https://api.tap.company/v2';
const TAP_SECRET_KEY = process.env.TAP_SECRET_KEY;

//TAP API request
const tapRequest = async (method, endpoint, body = null) => {
    const options = {
        method,
        headers: {
            'Authorization': `Bearer ${TAP_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    };
    if (body) options.body = JSON.stringify(body);
    const result = await fetch(`${TAP_API_BASE}${endpoint}`, options);
    return result.json();
};

//calculating number of service days
const getServiceDays = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1);
};

//build and fire a tap charge
const fireTapCharge = async ({client, chargeAmount, requestId, paymentPhase}) => {
    const payload = {
        amount: chargeAmount,
        currency: 'EGP',
        customer_initiated: true,
        threeDSecure: true,
        save_card: false,
        description: `CareLink - Request #${requestId} (${paymentPhase})`,
        metadata: {requestId: String(requestId), paymentPhase},
        reference: {
            transaction: `TXN_${requestId}_${paymentPhase}_${Date.now()}`,
            order: `ORDER_${requestId}`
        },
        receipt: {email: true, sms: false},
        customer: {
            first_name: client.full_name.split(' ')[0],
            last_name: client.full_name.split(' ').slice(1).join(' ') || '-',
            email: client.email,
            phone: {
                country_code: '20',
                number: client.phone_number.replace(/^(\+20|0)/, ''),
            }
        },
        source: {id: 'src_all'},
        post: {url: `${process.env.BACKEND_URL}/api/payments/webhook`},
        redirect: {url: `${process.env.FRONTEND_URL}/payment-result?requestId=${requestId}`}
    };
    return tapRequest('POST', '/charges', payload);
};

//fetching the request + caregiver rate + client profile (used by both payment phases)
const getPaymentContext = async (requestId, userId, res) => {
    const [clients] = await db.promise().query(
        `SELECT client_id, full_name, email, phone_number
        FROM client_profiles WHERE user_id = ?`, [userId]
    );
    if (clients.length === 0) {
        res.status(404).json({ message: 'Client Profile Not Found' });
        return null;
    }
    const client = clients[0];
    //join request_caregivers to find the caregiver who accepted the request
    //join caregiver_profiles to get their day rate for the requested category
    const [rows] = await db.promise().query(
        `SELECT cr.request_id, cr.start_date, cr.end_date, cr.status,
        cr.client_id, cr.day_category,
        rc.caregiver_id,
        CASE cr.day_category
            WHEN 'A' THEN cp.day_rate_a
            WHEN 'B' THEN cp.day_rate_b
            WHEN 'C' THEN cp.day_rate_c
            WHEN 'D' THEN cp.day_rate_d
        END AS caregiver_rate
        FROM care_requests cr
        JOIN request_caregivers rc ON cr.request_id = rc.request_id AND rc.response = 'Accepted'
        JOIN caregiver_profiles cp ON rc.caregiver_id = cp.caregiver_id
        WHERE cr.request_id = ? AND cr.client_id = ?`, [requestId, client.client_id]
    );

    if (rows.length === 0) {
        res.status(404).json({message: 'Accepted Request Not Found'});
        return null;
    }
    const request = rows[0];
    const days = getServiceDays(request.start_date, request.end_date);
    const totalAmount = parseFloat((request.caregiver_rate * days).toFixed(2));

    return { client, request, totalAmount, days };
};

// Phase 1 — UPFRONT (optional deposit, right after acceptance):
//   Client may pay a chosen amount upfront.
//   POST /api/payments/pay-upfront  { requestId, upfrontAmount }
//
// Phase 2 — FINAL (after the service has ended):
//   Client is prompted with the remaining due amount.
//   POST /api/payments/pay-final  { requestId }
//   The remaining = totalAmount - sum of all CAPTURED payments for this request.

//Phase 1 — UPFRONT
export const payUpfront = async (req, res) => {
    try {
        const {requestId, upfrontAmount} = req.body;
        if (!upfrontAmount || upfrontAmount <= 0) {
            return res.status(400).json({message: 'Upfront amount must be a positive number'});
        }
        
        const context = await getPaymentContext(requestId, req.user.id, res);
        if (!context) return;

        const {client, request, totalAmount, days} = context;
        
        if (request.status !== 'Accepted') {
            return res.status(400).json({message: 'Upfront Payment Only Available For Accepted Requests'});
        }

        //ensuring no upfront payment was already captured for this request
        const [existingUpfront] = await db.promise().query(
            `SELECT payment_id FROM payments 
            WHERE request_id = ? AND payment_phase = 'Upfront' AND status = 'CAPTURED'`,
            [requestId]
        );
        if (existingUpfront.length > 0) {
            return res.status(400).json({message: 'Upfront payment already made for this request'});
        }
        //ensuring the upfront amount does not exceed the total
        const upfront = parseFloat(parseFloat(upfrontAmount).toFixed(2));
        if (upfront >= totalAmount) {
            return res.status(400).json({message: `Upfront amount ${upfront} cannot exceed or equal the total service cost (${totalAmount} EGP - The remaining balance is paid after service completion.)`,
                totalAmount,
                days,
                caregiverRate: request.caregiver_rate
            });
        }
        const tapResponse = await fireTapCharge({
            client,
            chargeAmount: upfront,
            requestId,
            paymentPhase: 'Upfront'
        });
        if (tapResponse.errors || !tapResponse.id) {
            return res.status(502).json({message: 'Tap Charge Creation Failed', details: tapResponse});
        }
        //save payment record
        await db.promise().query(
            `INSERT INTO payments (request_id, client_id, caregiver_id, tap_charge_id,
            amount, total_amount, payment_phase, status) VALUES (?, ?, ?, ?, ?, ?, 'Upfront', 'INITIATED')`,
            [requestId, client.client_id, request.caregiver_id, tapResponse.id, upfront, totalAmount]
        );
        res.status(201).json({
            chargeId: tapResponse.id,
            transactionUrl: tapResponse.transaction?.url,
            amount: upfront,
            totalAmount,
            remaining: parseFloat((totalAmount - upfront).toFixed(2)),
            days,
            caregiverRate: request.caregiver_rate,
            currency: 'EGP'
        });
    } catch (error) {
        res.status(500).json({error: error.message});
    }
};

// Phase 2 — FINAL (after the service has ended)
export const payFinalBalance = async (req, res) => {
    try {
        const {requestId} = req.body;
        const context = await getPaymentContext(requestId, req.user.id, res);
        if (!context) return;
        const {client, request, totalAmount, days} = context;
        if (request.status !== 'Completed') {
            return res.status(400).json({message: 'Final Payment Is Only Available After The Service Is Marked As Completed'});
        }
        //sum already captured payments for this request
        const [paid] = await db.promise().query(
            `SELECT COALESCE(SUM(amount), 0) AS total_paid
            FROM payments WHERE request_id = ? AND status = 'CAPTURED'`,
            [requestId]
        );
        const totalPaid = parseFloat(paid[0].total_paid);
        const remaining = parseFloat((totalAmount - totalPaid).toFixed(2));
        if (remaining <= 0) {
            return res.status(400).json({message: 'No Remaining Balance - Request Is Fully Paid'});
        }
        //the service must end before paying the final balance
        // const serviceEnded = new Date(request.end_date) < new Date();
        // if (!serviceEnded) {
        //     return res.status(400).json({message: 'Final balance can only be paid after the service has ended',
        //         serviceEndDate: request.end_date
        //     });
        //}
        //payment
        const tapResponse = await fireTapCharge({
            client,
            chargeAmount:      remaining,
            requestId,
            paymentPhase:      'Final',
        });
        if (tapResponse.errors || !tapResponse.id) {
            return res.status(502).json({message: 'Tap Charge Creation Failed', details: tapResponse});
        }
        await db.promise().query(
            `INSERT INTO payments (request_id, client_id, caregiver_id, 
            tap_charge_id,amount, total_amount, payment_phase, status)
            VALUES (?, ?, ?, ?, ?, ?, 'Final', 'INITIATED')`,
            [requestId, client.client_id, request.caregiver_id,
            tapResponse.id, remaining, totalAmount]
        );

        res.status(201).json({
            chargeId:       tapResponse.id,
            transactionUrl: tapResponse.transaction?.url,
            amount:         remaining,
            totalAmount,
            totalPaid,
            days,
            caregiverRate: request.caregiver_rate,
            currency:       'EGP',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Verify Charge
export const verifyCharge = async (req, res) => {
    try {
        const {tapChargeId} = req.params;
        const charge = await tapRequest('GET', `/charges/${tapChargeId}`);
        if (!charge || charge.errors) {
            return res.status(502).json({message: 'Failed to retrieve charge from Tap', details: charge});
        }
        const ourStatus = charge.status === 'CAPTURED' ? 'CAPTURED' : 'FAILED';
        const [result] = await db.promise().query(
            `UPDATE payments SET status = ?, verified_at = NOW()
            WHERE tap_charge_id = ?`, [ourStatus, tapChargeId]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({message: 'No payment record found for this charge ID'});
        }
        if (ourStatus === 'CAPTURED') {
            const [paymentRow] = await db.promise().query(
                `SELECT request_id, payment_phase FROM payments WHERE tap_charge_id = ?`,
                [tapChargeId]
            );
            if (paymentRow.length > 0 && paymentRow[0].payment_phase === 'Final') {
                await db.promise().query(`UPDATE care_requests SET status = 'Paid' WHERE request_id = ?`, [paymentRow[0].request_id]);
            }
        }
        
        res.json({
            status:    ourStatus,
            tapStatus: charge.status,
            amount:    charge.amount,
            currency:  charge.currency,
            message:   ourStatus === 'CAPTURED' ? 'Payment successful' : 'Payment failed or cancelled',
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//Tap Webhook
export const tapWebhook = async (req, res) => {
    try {
        const receivedHash = req.headers['hashstring'];
        if (receivedHash && process.env.TAP_WEBHOOK_SECRET) {
            const expectedHash = crypto.createHmac('sha256', process.env.TAP_WEBHOOK_SECRET).update(JSON.stringify(req.body)).digest('hex');
            if (receivedHash !== expectedHash) {
                return res.status(400).json({message: 'Invalid webhook signature'});
            }
        }
        const {id: tapChargeId, status} = req.body;
        if (!tapChargeId) return res.status(400).json({ message: 'Missing charge id' });
        const ourStatus = status === 'CAPTURED' ? 'CAPTURED' : 'FAILED';
        await db.promise().query(
            `UPDATE payments SET status = ?, verified_at = NOW() WHERE tap_charge_id = ?`,
            [ourStatus, tapChargeId]
        );
        if (ourStatus === 'CAPTURED') {
            const [paymentRow] = await db.promise().query(
                `SELECT request_id, payment_phase FROM payments WHERE tap_charge_id = ?`,
                [tapChargeId]
            );
            if (paymentRow.length > 0 && paymentRow[0].payment_phase === 'Final') {
                await db.promise().query(
                    `UPDATE care_requests SET status = 'Paid' WHERE request_id = ?`,
                    [paymentRow[0].request_id]
                );
            }
        }
        res.json({ received: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//getting payment summary
//Returns all payment records for a request + remaining balance.
export const getPaymentStatus = async (req, res) => {
    try {
        const {requestId} = req.params;
        const userId = req.user.id;
        const [clients] = await db.promise().query(
            `SELECT client_id FROM client_profiles WHERE user_id = ?`, [userId]
        );
        if (clients.length === 0) return res.status(404).json({ message: 'Client Profile Not Found' });
        const [payments] = await db.promise().query(
            `SELECT payment_id, tap_charge_id, amount, total_amount,
            payment_phase, status, verified_at, created_at
            FROM payments
            WHERE request_id = ? AND client_id = ?
            ORDER BY created_at ASC`,
            [requestId, clients[0].client_id]
        );
        const totalPaid = payments.filter(p => p.status === 'CAPTURED').reduce((sum, p) => sum + parseFloat(p.amount), 0);
        const totalAmount = payments[0]?.total_amount || 0;
        const remaining   = parseFloat((totalAmount - totalPaid).toFixed(2));
        res.json({ payments, totalAmount, totalPaid, remaining });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};