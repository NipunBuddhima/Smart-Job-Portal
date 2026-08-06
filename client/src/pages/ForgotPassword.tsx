import { useState } from 'react';
import { api } from '../api/axios';
import toast from 'react-hot-toast';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset email sent! Check your inbox.');
      setEmail('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96 space-y-4">
        <h2 className="text-xl font-bold">Reset Password</h2>
        <p className="text-sm text-gray-600">Enter your email and we'll send you a reset link.</p>
        <input 
          type="email" 
          required 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          placeholder="your@email.com"
        />
        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
          {loading ? 'Sending...' : 'Send Link'}
        </button>
      </form>
    </div>
  );
};