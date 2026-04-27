import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import apiClient from '../../utils/apiclient';

// ─── React Router v7 requires this on every route file ──────────────────────
export function loader() {
  return null;
}

// ════════════════════════════════════════════════════════════════════════════
// 🔧 DEV FLAGS — set both to false before going to production
// ════════════════════════════════════════════════════════════════════════════
const USE_MOCK   = true;
const DEV_BYPASS = true;
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// 🧪 MOCK RESULT
//
// Change MOCK_RESULT to test each screen:
//
//   'success' → Green success screen with chat button
//              To test: set MOCK_RESULT = 'success', save, go to /payment-result?requestId=1&tap_id=mock_test
//
//   'failed'  → Red failed screen with Try Again button
//              To test: set MOCK_RESULT = 'failed', save, go to /payment-result?requestId=1&tap_id=mock_test
// ════════════════════════════════════════════════════════════════════════════
type MockResult = 'success' | 'failed';
const MOCK_RESULT: MockResult = 'success';
// ════════════════════════════════════════════════════════════════════════════

// ════════════════════════════════════════════════════════════════════════════
// 🧪 MOCK VERIFY RESPONSE — matches what GET /payments/verify/:tapChargeId returns
// ════════════════════════════════════════════════════════════════════════════
const MOCK_SUCCESS_DETAILS = {
  status:    'CAPTURED',
  tapStatus: 'CAPTURED',
  amount:    1000,
  currency:  'EGP',
  message:   'Payment successful',
};
const MOCK_FAILED_DETAILS = {
  status:    'FAILED',
  tapStatus: 'DECLINED',
  amount:    1000,
  currency:  'EGP',
  message:   'Card was declined by the issuing bank.',
};
// ════════════════════════════════════════════════════════════════════════════

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // TAP redirects back to: /payment-result?requestId=X&tap_id=chg_xxxxxxxx
  const tapId     = searchParams.get('tap_id');
  const requestId = searchParams.get('requestId');

  const [loading, setLoading]               = useState(true);
  const [status, setStatus]                 = useState<'success' | 'failed' | 'unknown'>('unknown');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError]                   = useState<string | null>(null);

  useEffect(() => {
    if (!DEV_BYPASS && !tapId) {
      setError('No payment ID found. This page should only be reached after a TAP redirect.');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        setLoading(true);

        // ── MOCK ──────────────────────────────────────────────────────────
        if (USE_MOCK) {
          await new Promise((r) => setTimeout(r, 1500)); // fake verify delay
          if (MOCK_RESULT === 'success') {
            setPaymentDetails(MOCK_SUCCESS_DETAILS);
            setStatus('success');
          } else {
            setPaymentDetails(MOCK_FAILED_DETAILS);
            setStatus('failed');
          }
        }
        // ── REAL API ──────────────────────────────────────────────────────
        else {
          // GET /api/payments/verify/:tapChargeId
          // Returns: { status, tapStatus, amount, currency, message }
          const response = await apiClient.get(`/payments/verify/${tapId}`);
          setPaymentDetails(response.data);
          setStatus(response.data.status === 'CAPTURED' ? 'success' : 'failed');
        }
        // ─────────────────────────────────────────────────────────────────
      } catch (err: any) {
        console.error('❌ verify error:', err);
        setError(err.response?.data?.message || 'Failed to verify payment');
        setStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    // Small delay so TAP has time to fully process before we call verify
    const timer = setTimeout(verify, 1500);
    return () => clearTimeout(timer);
  }, [tapId]);

  // ── LOADING ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full mx-4 text-center">
          <div className="w-20 h-20 border-4 border-[#1976D2] border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-slate-700 mb-2">Verifying Payment</h2>
          <p className="text-slate-500">Please wait while we confirm your transaction...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200">

      {/* Dev banner */}
      {(USE_MOCK || DEV_BYPASS) && (
        <div className="bg-yellow-400 text-yellow-900 text-sm font-semibold py-2 px-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-center">
          {USE_MOCK   && <span> MOCK RESULT — <code className="font-mono">{MOCK_RESULT}</code></span>}
          {DEV_BYPASS && <span> DEV BYPASS ON</span>}
          {USE_MOCK && (
            <span className="w-full text-xs font-normal mt-0.5">
              TAP sandbox test card: <code className="font-mono">4111 1111 1111 1111</code> — Exp: any future date — CVV: any 3 digits — OTP: <code className="font-mono">000000</code>
            </span>
          )}
        </div>
      )}

      <main className="max-w-2xl mx-auto px-10 py-7">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">

          {/* ── SUCCESS ── */}
          {status === 'success' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Payment Successful!</h2>
              <p className="text-slate-500 mb-8">Your payment has been processed successfully.</p>

              {/* Transaction details */}
              {paymentDetails && (
                <div className="bg-slate-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-bold text-slate-700 mb-4 text-center">Transaction Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amount Paid:</span>
                      <span className="font-semibold text-slate-800">
                        {paymentDetails.amount} {paymentDetails.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-semibold text-green-600">Completed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Transaction ID:</span>
                      <span className="font-mono text-sm text-slate-700">
                        {tapId ? `${tapId.slice(0, 22)}...` : 'mock_tap_charge_12345'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                {/*
                  ── CHAT BUTTON ─────────────────────────────────────────────
                  Update '/chat/:requestId' to match Amr's chat route.
                  requestId from the URL is passed in automatically.
                  ─────────────────────────────────────────────────────────── 
                */}
                <button
                  onClick={() => navigate(`/chat/${requestId}`)}
                  className="w-full bg-gradient-to-r from-emerald-500 to-[#26C6DA] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Chat with Caregiver
                </button>

                <button
                  onClick={() => navigate('/dashboard/client')}
                  className="w-full bg-gradient-to-r from-[#1976D2] to-[#26C6DA] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Back to Dashboard
                </button>

                <button
                  onClick={() => navigate(`/requests/${requestId}`)}
                  className="w-full bg-white border-2 border-[#1976D2] text-[#1976D2] py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all"
                >
                  View Request Details
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-3 text-sm text-slate-500">
                  <svg className="w-5 h-5 text-[#1976D2] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>A payment confirmation has been sent to your email address.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── FAILED ── */}
          {status === 'failed' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-800 mb-3">Payment Failed</h2>
              <p className="text-slate-500 mb-8">
                {error || paymentDetails?.message || 'Your payment could not be processed. Please try again.'}
              </p>

              {paymentDetails && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-red-800 mb-4 text-center">Transaction Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Status:</span>
                      <span className="font-semibold text-red-600">{paymentDetails.tapStatus || 'Failed'}</span>
                    </div>
                    {paymentDetails.message && (
                      <div className="text-sm text-slate-600 mt-1">{paymentDetails.message}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {/* Goes back to PaymentForm */}
                <button
                  onClick={() => navigate(`/payment/${requestId}`)}
                  className="w-full bg-gradient-to-r from-[#1976D2] to-[#26C6DA] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/dashboard/client')}
                  className="w-full bg-white border-2 border-slate-300 text-slate-600 py-4 rounded-xl font-semibold hover:bg-slate-50 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="flex items-start gap-3 text-sm text-slate-500">
                  <svg className="w-5 h-5 text-[#1976D2] shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>If you continue to experience issues, please contact our support team.</p>
                </div>
              </div>
            </div>
          )}

          {/* ── UNKNOWN ── */}
          {status === 'unknown' && (
            <div className="text-center py-8">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-slate-700 mb-3">Payment Status Unknown</h2>
              <p className="text-slate-500 mb-8">{error || "We couldn't determine your payment status."}</p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-[#1976D2] to-blue-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Refresh Status
                </button>
                <button
                  onClick={() => navigate('/dashboard/client')}
                  className="w-full bg-white border-2 border-blue-300 text-slate-500 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}