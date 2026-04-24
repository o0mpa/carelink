import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import apiClient from '../../utils/apiclient';

interface PaymentFormProps {
  // Optional - you can pass data from parent if needed
}

interface RequestDetails {
  requestId: number;
  caregiverRate: number;
  totalAmount: number;
  days: number;
  status: string;
  startDate: string;
  endDate: string;
}

interface PaymentStatus {
  totalAmount: number;
  totalPaid: number;
  remaining: number;
  payments: Array<{
    payment_id: number;
    amount: number;
    payment_phase: string;
    status: string;
    created_at: string;
  }>;
}

export default function PaymentForm({}: PaymentFormProps) {
  const { requestId } = useParams<{ requestId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);
  const [paymentType, setPaymentType] = useState<'upfront' | 'final'>('upfront');
  const [upfrontAmount, setUpfrontAmount] = useState<string>('');

  // Fetch payment status on mount
  useEffect(() => {
    if (!requestId) {
      console.error('❌ No requestId found in URL params');
      setError('No request ID provided');
      setLoading(false);
      return;
    }

    const fetchPaymentStatus = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching payment status for requestId:', requestId);
        console.log('🔑 Token:', localStorage.getItem('carelink_token') ? 'EXISTS' : 'MISSING');
        
        const response = await apiClient.get(`/payments/status/${requestId}`);
        
        console.log('✅ Payment status received:', response.data);
        setPaymentStatus(response.data);

        // Check if upfront already paid
        const hasUpfront = response.data.payments.some(
          (p: any) => p.payment_phase === 'Upfront' && p.status === 'CAPTURED'
        );

        console.log('💰 Has upfront payment:', hasUpfront);

        // Auto-select payment type based on status
        if (hasUpfront && response.data.remaining > 0) {
          setPaymentType('final');
          console.log('🎯 Auto-selected FINAL payment');
        }
      } catch (err: any) {
        console.error('❌ Error fetching payment status:', err);
        console.error('❌ Response data:', err.response?.data);
        console.error('❌ Status code:', err.response?.status);
        
        const errorMessage = err.response?.data?.message || 'Failed to load payment information';
        setError(errorMessage);
        
        // Show more detailed error in console
        if (err.response?.status === 401) {
          console.error('🚫 UNAUTHORIZED - Token might be invalid or expired');
        } else if (err.response?.status === 404) {
          console.error('🚫 NOT FOUND - Request or client profile not found');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentStatus();
  }, [requestId]);

  const handlePayment = async () => {
    if (!requestId) return;

    try {
      setSubmitting(true);
      setError(null);

      let response;

      if (paymentType === 'upfront') {
        // Validate upfront amount
        const amount = parseFloat(upfrontAmount);
        if (!amount || amount <= 0) {
          setError('Please enter a valid amount');
          setSubmitting(false);
          return;
        }

        if (paymentStatus && amount >= paymentStatus.totalAmount) {
          setError(`Upfront amount must be less than total (${paymentStatus.totalAmount} EGP)`);
          setSubmitting(false);
          return;
        }

        console.log('💳 Initiating UPFRONT payment:', amount, 'EGP');
        response = await apiClient.post('/payments/pay-upfront', {
          requestId: parseInt(requestId),
          upfrontAmount: amount,
        });
      } else {
        console.log('💳 Initiating FINAL payment');
        // Final payment
        response = await apiClient.post('/payments/pay-final', {
          requestId: parseInt(requestId),
        });
      }

      console.log('✅ Payment response:', response.data);

      // Redirect to TAP payment page
      if (response.data.transactionUrl) {
        console.log('🔄 Redirecting to TAP:', response.data.transactionUrl);
        window.location.href = response.data.transactionUrl;
      } else {
        console.error('❌ No transaction URL in response');
        setError('Payment URL not received. Please try again.');
        setSubmitting(false);
      }
    } catch (err: any) {
      console.error('❌ Payment error:', err);
      console.error('❌ Response:', err.response?.data);
      setError(err.response?.data?.message || 'Payment initiation failed');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200 flex items-center justify-center">
        <div className="text-blue-900 text-xl font-semibold">Loading payment information...</div>
      </div>
    );
  }

  if (error && !paymentStatus) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full">
          <div className="text-red-500 text-center mb-6 text-lg font-semibold">Error</div>
          <div className="text-gray-700 text-center mb-6">{error}</div>
          
          {/* Debug info */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
            <div className="text-sm text-gray-600 font-mono">
              <div>Request ID: {requestId || 'NOT FOUND'}</div>
              <div>Token: {localStorage.getItem('carelink_token') ? 'EXISTS' : 'MISSING'}</div>
              <div>Role: {localStorage.getItem('carelink_role') || 'NOT SET'}</div>
            </div>
          </div>

          <button
            onClick={() => navigate('/dashboard/client')}
            className="w-full bg-white border-2 border-blue-300 text-slate-500 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const hasUpfrontPaid = paymentStatus?.payments.some(
    (p) => p.payment_phase === 'Upfront' && p.status === 'CAPTURED'
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 via-white to-emerald-200">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#1976D2] to-[#26C6DA] rounded-lg flex items-center justify-center">
              <span className="text-white text-xl font-bold">+</span>
            </div>
            <h1 className="text-2xl font-bold text-[#1976D2]">CareLink</h1>
          </div>
          <button
            onClick={() => navigate('/dashboard/client')}
            className="text-[#1976D2] hover:text-[#1565C0] font-semibold"
          >
            Back to Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Title */}
          <h2 className="text-3xl font-bold text-[#1976D2] mb-2 text-center">
            Payment
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Complete your payment to continue with your care request
          </p>

          {/* Payment Summary */}
          {paymentStatus && (
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Service Cost:</span>
                  <span className="font-semibold text-gray-800">{paymentStatus.totalAmount} EGP</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Already Paid:</span>
                  <span className="font-semibold text-green-600">{paymentStatus.totalPaid} EGP</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-gray-800 font-semibold">Remaining Balance:</span>
                  <span className="font-bold text-[#1976D2] text-lg">{paymentStatus.remaining} EGP</span>
                </div>
              </div>
            </div>
          )}

          {/* Payment Type Selection */}
          {!hasUpfrontPaid && paymentStatus && paymentStatus.remaining > 0 && (
            <div className="mb-8">
              <label className="block text-gray-700 font-semibold mb-3">
                Select Payment Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentType('upfront')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentType === 'upfront'
                      ? 'border-[#1976D2] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800 mb-1">Upfront Payment</div>
                  <div className="text-sm text-gray-600">Pay a partial amount now</div>
                </button>
                <button
                  onClick={() => setPaymentType('final')}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    paymentType === 'final'
                      ? 'border-[#1976D2] bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-semibold text-gray-800 mb-1">Full Payment</div>
                  <div className="text-sm text-gray-600">Pay the entire amount</div>
                </button>
              </div>
            </div>
          )}

          {/* Upfront Amount Input */}
          {paymentType === 'upfront' && !hasUpfrontPaid && (
            <div className="mb-8">
              <label htmlFor="upfrontAmount" className="block text-gray-700 font-semibold mb-2">
                Enter Upfront Amount (EGP)
              </label>
              <input
                type="number"
                id="upfrontAmount"
                value={upfrontAmount}
                onChange={(e) => setUpfrontAmount(e.target.value)}
                placeholder="Enter amount"
                min="1"
                max={paymentStatus ? paymentStatus.totalAmount - 1 : undefined}
                className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-[#1976D2] focus:outline-none text-lg"
              />
              <p className="text-sm text-gray-500 mt-2">
                Must be less than total amount ({paymentStatus?.totalAmount} EGP)
              </p>
            </div>
          )}

          {/* Final Payment Info */}
          {paymentType === 'final' && paymentStatus && (
            <div className="mb-8 bg-blue-50 border-2 border-[#1976D2] rounded-xl p-6">
              <h4 className="font-semibold text-[#1976D2] mb-2">Final Payment</h4>
              <p className="text-gray-700 mb-4">
                You will pay the remaining balance of <span className="font-bold">{paymentStatus.remaining} EGP</span>
              </p>
              <p className="text-sm text-gray-600">
                This will complete your payment for this care request.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {/* Submit Button */}
          {paymentStatus && paymentStatus.remaining > 0 && (
            <button
              onClick={handlePayment}
              disabled={submitting}
              className={`w-full py-4 rounded-xl font-semibold text-white text-lg transition-all ${
                submitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#1976D2] to-[#26C6DA] hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              {submitting ? 'Processing...' : `Proceed to Payment`}
            </button>
          )}

          {/* Fully Paid Message */}
          {paymentStatus && paymentStatus.remaining <= 0 && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">Payment Complete!</h3>
              <p className="text-gray-600 mb-6">This request has been fully paid.</p>
              <button
                onClick={() => navigate('/dashboard/client')}
                className="bg-[#1976D2] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#1565C0] transition-colors"
              >
                Back to Dashboard
              </button>
            </div>
          )}

          {/* Security Note */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-start gap-3 text-sm text-gray-600">
              <svg className="w-5 h-5 text-[#1976D2] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>
                You will be redirected to our secure payment gateway (TAP) to complete your transaction.
                Your payment information is encrypted and secure.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}