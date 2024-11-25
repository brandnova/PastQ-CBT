import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from '../components/alert';
import { Button } from '../components/button';
import { Copy, CheckCircle } from 'lucide-react';

const PaymentRedirectHandler = ({ user }) => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [paymentReference, setPaymentReference] = useState(null);
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.hash.includes('?') 
        ? window.location.hash.split('?')[1] 
        : location.search
    );
    const status = params.get('status');
    const reference = params.get('reference');
    setPaymentStatus(status);
    setPaymentReference(reference);
  }, [location]);

  const handleReturnHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    console.log('Contacting support...');
  };

  const handleRetryPayment = async () => {
    try {
      const response = await api.post('/payments/initialize/');
      
      if (response.data.authorization_url) {
        window.location.href = response.data.authorization_url;
      }
    } catch (error) {
      console.error('Failed to initialize payment:', error);
      setError(error.response?.data?.error || 'Failed to initialize payment. Please try again.');
    }
  };

  const handleCopyReference = async () => {
    try {
      await navigator.clipboard.writeText(paymentReference);
      setShowCopyAlert(true);
      setTimeout(() => setShowCopyAlert(false), 3000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="bg-white shadow-md rounded-lg p-6">
        {showCopyAlert && (
          <Alert className="bg-green-100 border-green-400 text-green-700 mb-4 transition-opacity duration-300">
            <AlertTitle className="text-sm font-medium flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Copied Successfully
            </AlertTitle>
          </Alert>
        )}

        {paymentStatus === 'success' ? (
          <Alert className="bg-green-100 border-green-400 text-green-700 mb-4">
            <AlertTitle className="text-lg font-bold">
              Payment Successful
            </AlertTitle>
            <AlertDescription>
              <p className="mt-2">
                Thank you, {user?.first_name} {user?.last_name}! Your payment has been processed successfully.
              </p>
              <p className="mt-2">Your subscription is now active.</p>
              {paymentReference && (
                <div className="mt-4 p-3 bg-white rounded-md border border-green-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Please save your payment reference for future correspondence with support or for your records.
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="bg-gray-100 px-3 py-1 rounded flex-1">
                      {paymentReference}
                    </code>
                    <Button
                      onClick={handleCopyReference}
                      className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                  </div>
                </div>
              )}
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="bg-red-100 border-red-400 text-red-700 mb-4">
            <AlertTitle className="text-lg font-bold">Payment Failed</AlertTitle>
            <AlertDescription>
              <p className="mt-2">
                We couldn't process your payment. Please try again or contact support.
              </p>
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mt-6 space-y-4">
          <Button 
            onClick={handleReturnHome}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
          >
            Return to Homepage
          </Button>
          
          {paymentStatus === 'failed' && (
            <>
              <Button 
                onClick={handleRetryPayment}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
              >
                Retry Payment
              </Button>
              <Button 
                onClick={handleContactSupport}
                className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                Contact Support
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentRedirectHandler;