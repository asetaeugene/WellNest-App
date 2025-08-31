import React, { useState } from 'react';
import axios from 'axios';

const PaystackButton: React.FC = () => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(2000); // default ₦2000
  const [loading, setLoading] = useState(false);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Initialize transaction on backend
      const res = await axios.post('/api/paystack/initialize', { email, amount });
      const { authorization_url, reference } = res.data.data;

      // 2. Open Paystack inline
      const handler = (window as any).PaystackPop.setup({
        key: 'pk_live_xxxxxxxxxxxxxxxxxxxxx', // Use your public key
        email,
        amount: amount * 100,
        ref: reference,
        callback: async (response: any) => {
          // 3. Verify transaction on backend
          const verifyRes = await axios.get(`/api/paystack/verify/${response.reference}`);
          if (verifyRes.data.data.status === 'success') {
            window.location.href = '/success'; // Redirect to thank you page
          } else {
            alert('Payment verification failed.');
          }
        },
        onClose: () => {
          alert('Payment cancelled.');
        }
      });
      handler.openIframe();
    } catch (err) {
      alert('Error initializing payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePay} className="max-w-sm mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-2">Pay with Paystack</h2>
      <input
        type="email"
        required
        placeholder="Email"
        className="border p-2 mb-2 w-full"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <input
        type="number"
        required
        placeholder="Amount (₦)"
        className="border p-2 mb-2 w-full"
        value={amount}
        onChange={e => setAmount(Number(e.target.value))}
        min={100}
      />
      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded w-full"
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
};

export default PaystackButton;
