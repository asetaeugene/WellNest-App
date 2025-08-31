import React from 'react';

const SuccessPage: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen">
    <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
    <p>Thank you for your payment. Your premium access is now active.</p>
  </div>
);

export default SuccessPage;
