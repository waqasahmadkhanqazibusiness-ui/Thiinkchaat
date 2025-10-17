import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';
import { UserIcon } from '../components/icons/UserIcon';

const ConfirmPage: React.FC = () => {
  const { user, sendOtp, logout } = useAuth();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    setIsLoading(true);
    await sendOtp();
    showToast('OTP sent to your Gmail.', 'success');
    // The user is now automatically redirected to the OtpPage by the state change in AuthContext.
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-100">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-md w-full relative">
        <button onClick={logout} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors text-sm">Sign out</button>
        <div className="flex justify-center mb-4">
            {user?.avatarUrl ?
                <img src={user.avatarUrl} alt="user avatar" className="w-20 h-20 rounded-full"/>
                : <UserIcon className="w-20 h-20 p-4 bg-gray-700 rounded-full text-gray-400" />
            }
        </div>
        <h1 className="text-2xl font-bold mb-2">Confirm Your Identity</h1>
        <p className="text-gray-400 mb-1">Signed in as</p>
        <p className="text-white font-semibold mb-1">{user?.name}</p>
        <p className="text-gray-400 font-mono text-sm mb-6">{user?.email}</p>
        
        <p className="text-gray-400 mb-8 max-w-xs mx-auto">“We’ll send a one-time code to your Gmail to confirm it’s you.”</p>
        
        <button
          onClick={handleSendOtp}
          disabled={isLoading}
          className="w-full bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-cyan-500 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Sending...' : 'Send OTP'}
        </button>
      </div>
    </div>
  );
};

export default ConfirmPage;