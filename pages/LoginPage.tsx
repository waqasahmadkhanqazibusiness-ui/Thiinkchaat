import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { GoogleIcon } from '../components/icons/GoogleIcon';
import { ThinkChatIcon } from '../components/icons/ThinkChatIcon';

const LoginPage: React.FC = () => {
  const { loginWithGoogle, loginWithEmail } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsLoading(true);
      loginWithEmail(email);
      showToast('OTP sent to your Gmail.', 'success');
      // Loading state will be reset by component unmount on navigation
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-100">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-sm w-full">
        <div className="flex justify-center mb-6">
          <ThinkChatIcon className="w-16 h-16 text-cyan-400" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Sign up to continue</h1>
        <p className="text-gray-400 mb-8">to ThinkChat</p>
        
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email to get started."
            required
            className="w-full bg-gray-700 text-white placeholder-gray-400 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="w-full bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-cyan-500 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
            disabled={!email.trim() || isLoading}
          >
            {isLoading ? 'Continuing...' : 'Continue with Email'}
          </button>
        </form>

        <div className="flex items-center my-6">
          <div className="flex-grow border-t border-gray-600"></div>
          <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
          <div className="flex-grow border-t border-gray-600"></div>
        </div>
        
        <button
          onClick={loginWithGoogle}
          className="w-full flex items-center justify-center bg-white text-gray-800 font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-gray-200 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
          aria-label="Continue with Google"
        >
          <GoogleIcon className="w-6 h-6 mr-3" />
          Continue with Google
        </button>

        <p className="text-xs text-gray-500 mt-8">
          Already have an account? <a href="#" onClick={(e) => e.preventDefault()} className="text-cyan-400 hover:underline">Log in</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;