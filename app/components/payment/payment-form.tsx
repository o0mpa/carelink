import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../../utils/apiclient';

export function loader() {
  return null;
}

const USE_MOCK   = true;
const DEV_BYPASS = true;

type MockScenario =
  | 'accepted_no_upfront'
  | 'accepted_upfront_paid'
  | 'completed_no_upfront'
  | 'completed_upfront_paid'
  | 'completed_fully_paid';

const MOCK_SCENARIO: MockScenario = 'accepted_no_upfront';


interface PaymentStatus {
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  payments: Array<{
    payment_id: number;
    amount: number;
    payment_phase: string; // 'Upfront' | 'Final'
    status: string;        // 'CAPTURED' | 'INITIATED' | 'FAILED'
    created_at: string;
  }>;
}

//   what the backend would return for each scenario
const MOCK_DATA: Record<MockScenario, {
  requestStatus: 'Accepted' | 'Completed';
  paymentStatus: PaymentStatus;
}> = {
  accepted_no_upfront: {
    requestStatus: 'Accepted',
    paymentStatus: {
      totalAmount: 1000,
      totalPaid:   0,
      remaining:   1000,
      payments:    [],
    },
  },
  accepted_upfront_paid: {
    requestStatus: 'Accepted',
    paymentStatus: {
      totalAmount: 3000,
      totalPaid:   800,
      remaining:   2200,
      payments: [{
        payment_id: 1, amount: 800, payment_phase: 'Upfront',
        status: 'CAPTURED', created_at: '2025-06-01T10:00:00.000Z',
      }],
    },
  },
  completed_no_upfront: {
    requestStatus: 'Completed',
    paymentStatus: {
      totalAmount: 3000,
      totalPaid:   0,
      remaining:   3000,
      payments:    [],
    },
  },
  completed_upfront_paid: {
    requestStatus: 'Completed',
    paymentStatus: {
      totalAmount: 3000,
      totalPaid:   800,
      remaining:   2200,
      payments: [{
        payment_id: 1, amount: 800, payment_phase: 'Upfront',
        status: 'CAPTURED', created_at: '2025-06-01T10:00:00.000Z',
      }],
    },
  },
  completed_fully_paid: {
    requestStatus: 'Completed',
    paymentStatus: {
      totalAmount: 3000,
      totalPaid:   3000,
      remaining:   0,
      payments: [
        { payment_id: 1, amount: 800,  payment_phase: 'Upfront', status: 'CAPTURED', created_at: '2025-06-01T10:00:00.000Z' },
        { payment_id: 2, amount: 2200, payment_phase: 'Final',   status: 'CAPTURED', created_at: '2025-06-10T14:00:00.000Z' },
      ],
    },
  },
};
// ════════════════════════════════════════════════════════════════════════════

export default function PaymentForm() {
  const { requestId: paramRequestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const requestId = DEV_BYPASS ? (paramRequestId ?? '1') : paramRequestId;

  const [loading, setLoading]             = useState(true);
  const [submitting, setSubmitting]       = useState(false);
  const [error, setError]                 = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [requestStatus, setRequestStatus] = useState<'Accepted' | 'Completed' | null>(null);
  const [upfrontAmount, setUpfrontAmount] = useState('');

  useEffect(() => {
    if (!DEV_BYPASS && !requestId) {
      setError('No request ID provided');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);

        let payStatus: PaymentStatus;
        let reqStatus: 'Accepted' | 'Completed';

        // ── MOCK ──────────────────────────────────────────────────────────
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 600));
          payStatus = MOCK_DATA[MOCK_SCENARIO].paymentStatus;
          reqStatus = MOCK_DATA[MOCK_SCENARIO].requestStatus;
        }
        // ── REAL API ──────────────────────────────────────────────────────
        else {
          // GET /api/payments/status/:requestId
          // Returns: { payments, totalAmount, totalPaid, remaining }
          const payRes = await apiClient.get(`/payments/status/${requestId}`);
          payStatus = payRes.data;

          // Derive request status from payments array:
          // If any 'Final' phase payment exists → backend only creates it for Completed requests
          // Otherwise → still Accepted
          //
          //  If you add GET /api/care-requests/:id later, replace with:
          //   const reqRes = await apiClient.get(`/care-requests/${requestId}`);
          //   reqStatus = reqRes.data.status;
          const hasFinal = payStatus.payments.some((p) => p.payment_phase === 'Final');
          reqStatus = hasFinal ? 'Completed' : 'Accepted';
        }
        // ─────────────────────────────────────────────────────────────────

        setPaymentStatus(payStatus);
        setRequestStatus(reqStatus);
      } catch (err: any) {
        console.error('❌ fetchData error:', err);
        setError(err.response?.data?.message || 'Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [requestId]);

  const handlePayment = async () => {
    if (!requestId) return;
    try {
      setSubmitting(true);
      setError(null);

      // ── MOCK ──────────────────────────────────────────────────────────
      if (USE_MOCK) {
        await new Promise((r) => setTimeout(r, 800));
        // Simulates TAP redirecting back to payment-result
        window.location.href = `/payment-result?requestId=${requestId}&tap_id=mock_tap_charge_12345`;
        return;
      }
      // ── REAL API ──────────────────────────────────────────────────────
      let response;

      if (requestStatus === 'Accepted') {
        // Upfront payment — POST /api/payments/pay-upfront
        const amount = parseFloat(upfrontAmount);
        if (!amount || amount < 50) {
          setError('Minimum upfront amount is 50 EGP');
          setSubmitting(false);
          return;
        }
        if (paymentStatus && amount >= paymentStatus.totalAmount) {
          setError(`Upfront amount must be less than total (${paymentStatus.totalAmount} EGP)`);
          setSubmitting(false);
          return;
        }
        response = await apiClient.post('/payments/pay-upfront', {
          requestId:     parseInt(requestId),
          upfrontAmount: amount,
        });
      } else {
        // Final payment — POST /api/payments/pay-final
        response = await apiClient.post('/payments/pay-final', {
          requestId: parseInt(requestId),
        });
      }

      // TAP returns a redirect URL for card entry
      if (response.data.transactionUrl) {
        window.location.href = response.data.transactionUrl;
      } else {
        setError('Payment URL not received. Please try again.');
        setSubmitting(false);
      }
      // ─────────────────────────────────────────────────────────────────
    } catch (err: any) {
      console.error('❌ handlePayment error:', err);
      setError(err.response?.data?.message || 'Payment initiation failed');
      setSubmitting(false);
    }
  };

  const upfrontCaptured = paymentStatus?.payments.some(
    (p) => p.payment_phase === 'Upfront' && p.status === 'CAPTURED'
  );

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
          <div className="w-14 h-14 border-4 border-[#1976D2] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-semibold">Loading payment information...</p>
        </div>
      </div>
    );
  }

  // ── FATAL ERROR ────────────────────────────────────────────────────────────
  if (error && !paymentStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-red-500 text-center mb-4 text-lg font-semibold">Error</div>
          <div className="text-slate-700 text-center mb-6">{error}</div>
          <div className="bg-slate-100 rounded-lg p-4 mb-6 font-mono text-sm text-slate-600 space-y-1">
            <div>Request ID : {requestId  || 'NOT FOUND'}</div>
            <div>Token      : {localStorage.getItem('carelink_token') ? 'EXISTS' : 'MISSING'}</div>
            <div>Role       : {localStorage.getItem('carelink_role')  || 'NOT SET'}</div>
            <div>DEV_BYPASS : {DEV_BYPASS ? 'ON ✓' : 'OFF'}</div>
            <div>USE_MOCK   : {USE_MOCK   ? 'ON ✓' : 'OFF'}</div>
          </div>
          <button
            onClick={() => navigate('/dashboard/client')}
            className="w-full border-2 border-blue-300 text-slate-500 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── MAIN PAGE ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200">

      {/* Dev banner */}
      {(USE_MOCK || DEV_BYPASS) && (
        <div className="bg-yellow-400 text-yellow-900 text-sm font-semibold py-2 px-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-center">
          {USE_MOCK   && <span> MOCK — scenario: <code className="font-mono">{MOCK_SCENARIO}</code></span>}
          {DEV_BYPASS && <span> DEV BYPASS — requestId: <code className="font-mono">{requestId}</code></span>}
          {USE_MOCK && (
            <span className="w-full text-xs font-normal mt-0.5">
              TAP sandbox test card: <code className="font-mono">4111 1111 1111 1111</code> — Exp: any future date — CVV: any 3 digits — OTP: <code className="font-mono">000000</code>
            </span>
          )}
        </div>
      )}

      <main className="max-w-2xl mx-auto px-10 py-7">
        <div className="bg-white rounded-2xl shadow-xl p-8">

          {/* Icon + Title */}
          <div className="flex flex-col items-center mb-6">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-blue-600 shadow-md ring-1 ring-blue-200 mb-3">
              <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </span>
            <h2 className="text-3xl font-bold bg-linear-to-r from-blue-500 to-blue-800 text-transparent bg-clip-text">
              Payment
            </h2>
          </div>

          {/* CASE: REQUEST IS ACCEPTED*/}
          {requestStatus === 'Accepted' && (
            <>
              {/* Upfront already paid — just waiting */}
              {upfrontCaptured && paymentStatus && (
                <>
                  <p className="text-slate-400 font-semibold text-center mb-4">
                    You've paid an upfront amount. The remaining balance will be due once your service is completed.
                  </p>
                  <div className="bg-slate-50 rounded-xl p-4 mb-6">
                    <h3 className="font-bold text-slate-700 mb-3">Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Service Cost:</span>
                        <span className="font-semibold text-slate-800">{paymentStatus.totalAmount} EGP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Upfront Paid:</span>
                        <span className="font-semibold text-green-600">{paymentStatus.totalPaid} EGP</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-slate-800">Remaining Balance:</span>
                        <span className="font-bold text-[#1976D2] text-lg">{paymentStatus.remaining} EGP</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 border-2 border-[#1976D2] rounded-xl p-4 mb-6">
                    <h4 className="font-semibold text-[#1976D2] mb-1">Upfront Paid ✓</h4>
                    <p className="text-slate-600 text-sm">
                      The remaining <span className="font-bold text-slate-800">{paymentStatus.remaining} EGP</span> will
                      be charged once your caregiver marks the service as complete.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/dashboard/client')}
                    className="w-full border-2 border-slate-300 text-slate-600 py-3 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                  >
                    Back to Dashboard
                  </button>
                </>
              )}

              {/* show optional upfront form */}
              {!upfrontCaptured && paymentStatus && (
                <>
                  <p className="text-slate-400 font-semibold text-center mb-4">
                    Your request has been accepted! You can optionally pay an upfront amount now, or pay the full amount when the service is complete.
                  </p>

                  {/* Payment Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-slate-700 mb-3">Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Service Cost:</span>
                        <span className="font-semibold text-slate-800">{paymentStatus.totalAmount} EGP</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Already Paid:</span>
                        <span className="font-semibold text-green-600">{paymentStatus.totalPaid} EGP</span>
                      </div>
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-slate-800">Remaining Balance:</span>
                        <span className="font-bold text-[#1976D2] text-lg">{paymentStatus.remaining} EGP</span>
                      </div>
                    </div>
                  </div>

                  {/* Upfront amount input */}
                  <div className="mb-2">
                    <label htmlFor="upfrontAmount" className="block text-slate-700 font-semibold mb-2">
                      Upfront Amount (EGP) <span className="text-slate-400 font-normal text-sm">— optional</span>
                    </label>
                    <input
                      type="number"
                      id="upfrontAmount"
                      value={upfrontAmount}
                      onChange={(e) => setUpfrontAmount(e.target.value)}
                      placeholder="Enter amount (min. 50 EGP)"
                      min="50"
                      max={paymentStatus.totalAmount - 1}
                      className="w-full px-4 py-2 rounded-xl border-2 border-gray-300 text-slate-600 text-lg focus:border-blue-200 focus:ring-1 focus:ring-blue-200 focus:outline-none transition-all"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      Minimum 50 EGP — must be less than {paymentStatus.totalAmount} EGP
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Pay upfront button */}
                  <button
                    onClick={handlePayment}
                    disabled={submitting}
                    className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all mt-4 ${
                      submitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#1976D2] to-[#26C6DA] hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    {submitting ? 'Processing...' : 'Pay Upfront'}
                  </button>

                  {/* Skip button */}
                  <button
                    onClick={() => navigate('/dashboard/client')}
                    disabled={submitting}
                    className="w-full mt-3 py-3 rounded-xl font-semibold text-slate-500 border-2 border-slate-300 hover:bg-slate-50 transition-all"
                  >
                    Skip for Now
                  </button>

                  <p className="text-center text-xs text-slate-400 mt-3">
                    You can always pay later from your dashboard. The full amount is due once the service is complete.
                  </p>
                </>
              )}
            </>
          )}

          {/* SERVICE IS COMPLETED */}
          {requestStatus === 'Completed' && paymentStatus && (
            <>
              {/* Still has balance to pay */}
              {paymentStatus.remaining > 0 && (
                <>
                  <p className="text-slate-400 font-semibold text-center mb-4">
                    Your service is complete. Please settle the{' '}
                    {upfrontCaptured ? 'remaining balance' : 'full amount'} to finalize your request.
                  </p>

                  {/* Payment Summary */}
                  <div className="bg-slate-50 rounded-xl p-4 mb-4">
                    <h3 className="font-bold text-slate-700 mb-3">Payment Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Total Service Cost:</span>
                        <span className="font-semibold text-slate-800">{paymentStatus.totalAmount} EGP</span>
                      </div>
                      {/* Only show "Already Paid" row if client actually paid something before */}
                      {upfrontCaptured && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Upfront Paid:</span>
                          <span className="font-semibold text-green-600">{paymentStatus.totalPaid} EGP</span>
                        </div>
                      )}
                      <div className="border-t pt-2 flex justify-between">
                        <span className="font-bold text-slate-800">
                          {upfrontCaptured ? 'Remaining Balance:' : 'Amount Due:'}
                        </span>
                        <span className="font-bold text-[#1976D2] text-lg">{paymentStatus.remaining} EGP</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 bg-blue-50 border-2 border-[#1976D2] rounded-xl p-4">
                    <h4 className="font-semibold text-[#1976D2] mb-1">
                      {upfrontCaptured ? 'Final Payment' : 'Payment Due'}
                    </h4>
                    <p className="text-slate-700 text-sm">
                      {upfrontCaptured
                        ? `You paid ${paymentStatus.totalPaid} EGP upfront. The remaining `
                        : 'The full amount of '}
                      <span className="font-bold">{paymentStatus.remaining} EGP</span>
                      {upfrontCaptured
                        ? ' is now due to fully settle this request.'
                        : ' is due to settle this request.'}
                    </p>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Pay button */}
                  <button
                    onClick={handlePayment}
                    disabled={submitting}
                    className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
                      submitting
                        ? 'bg-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-[#1976D2] to-[#26C6DA] hover:shadow-lg hover:scale-[1.02]'
                    }`}
                  >
                    {submitting ? 'Processing...' : `Pay ${paymentStatus.remaining} EGP`}
                  </button>
                </>
              )}

              {/* Fully paid */}
              {paymentStatus.remaining <= 0 && (
                <div className="text-center py-4">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Complete!</h3>
                  <p className="text-slate-500 mb-6">This request has been fully settled.</p>
                  <button
                    onClick={() => navigate('/dashboard/client')}
                    className="bg-[#1976D2] text-white px-8 py-3 rounded-xl font-semibold hover:bg-[#1565C0] transition-colors"
                  >
                    Back to Dashboard
                  </button>
                </div>
              )}
            </>
          )}

          {/* Security note — only shown when there's a pay button */}
          {paymentStatus && paymentStatus.remaining > 0 &&
            !(requestStatus === 'Accepted' && upfrontCaptured) && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-start gap-3 text-sm text-slate-500">
                <svg className="w-5 h-5 text-[#1976D2] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <p>You will be redirected to our secure payment gateway (TAP). Your payment information is encrypted and secure.</p>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}