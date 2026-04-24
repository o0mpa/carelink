import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import apiClient from '../../utils/apiclient';

interface PaymentResultProps {}

export default function PaymentResult({}: PaymentResultProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'unknown'>('unknown');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const requestId = searchParams.get('requestId');
  const tapId = searchParams.get('tap_id');

  useEffect(() => {
    if (!tapId || !requestId) {
      setError('Missing payment information');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        setLoading(true);

        // Verify the charge with backend
        const response = await apiClient.get(`/payments/verify/${tapId}`);

        setPaymentDetails(response.data);

        if (response.data.status === 'CAPTURED') {
          setPaymentStatus('success');
        } else {
          setPaymentStatus('failed');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.response?.data?.message || 'Failed to verify payment');
        setPaymentStatus('failed');
      } finally {
        setLoading(false);
      }
    };

    // Add a small delay to ensure TAP has processed the payment
    const timer = setTimeout(() => {
      verifyPayment();
    }, 1500);

    return () => clearTimeout(timer);
  }, [tapId, requestId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br bg-linear-to-br from-blue-200 via-white to-emerald-200 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md w-full mx-4">
          <div className="text-center">
            {/* Loading Spinner */}
            <div className="w-20 h-20 border-4 border-[#1976D2] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-slate-700 mb-2">Verifying Payment</h2>
            <p className="text-gray-600">Please wait while we confirm your transaction...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br bg-linear-to-br from-blue-200 via-white to-emerald-200">
      {/* Header
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-emerald-300 rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">+</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1976D2]">CareLink</h1>
          </div>
        </div>
      </header> */}

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Success State */}
          {paymentStatus === 'success' && (
            <div className="text-center">
              {/* Success Icon */}
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">Payment Successful!</h2>
              <p className="text-gray-600 mb-8">
                Your payment has been processed successfully.
              </p>

              {/* Payment Details */}
              {paymentDetails && (
                <div className="bg-gray-50 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-gray-800 mb-4 text-center">Transaction Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Amount Paid:</span>
                      <span className="font-semibold text-gray-800">
                        {paymentDetails.amount} {paymentDetails.currency}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-green-600">Completed</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transaction ID:</span>
                      <span className="font-mono text-sm text-gray-800">{tapId?.slice(0, 20)}...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/client-dashboard`)}
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

              {/* Confirmation Note */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-[#1976D2] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p>A payment confirmation has been sent to your email address.</p>
                </div>
              </div>
            </div>
          )}

          {/* Failed State */}
          {paymentStatus === 'failed' && (
            <div className="text-center">
              {/* Error Icon */}
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-gray-800 mb-3">Payment Failed</h2>
              <p className="text-gray-600 mb-8">
                {error || 'Your payment could not be processed. Please try again.'}
              </p>

              {/* Error Details */}
              {paymentDetails && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8 text-left">
                  <h3 className="font-semibold text-red-800 mb-4 text-center">Transaction Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-semibold text-red-600">
                        {paymentDetails.tapStatus || 'Failed'}
                      </span>
                    </div>
                    {paymentDetails.message && (
                      <div className="text-sm text-gray-700 mt-2">
                        {paymentDetails.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => navigate(`/payment/${requestId}`)}
                  className="w-full bg-gradient-to-r from-[#1976D2] to-[#26C6DA] text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate('/client-dashboard')}
                  className="w-full bg-white border-2 border-gray-300 text-gray-700 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                >
                  Back to Dashboard
                </button>
              </div>

              {/* Help Note */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="flex items-start gap-3 text-sm text-gray-600">
                  <svg className="w-5 h-5 text-[#1976D2] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>
                    If you continue to experience issues, please contact our support team for assistance.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Unknown/Error State */}
          {paymentStatus === 'unknown' && (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>

              <h2 className="text-3xl font-bold text-slate-700 mb-3">Payment Status Unknown</h2>
              <p className="text-gray-600 mb-8">
                We couldn't verify your payment status. {error}
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-[#1976D2] to-blue-500 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Refresh Status
                </button>
                <button
                  onClick={() => navigate('/client-dashboard')}
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