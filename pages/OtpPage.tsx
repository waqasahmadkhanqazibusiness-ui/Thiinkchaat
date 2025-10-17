import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { useToast } from '../ToastContext';

const OTP_LENGTH = 6;
const RESEND_TIMER = 60;

const OtpPage: React.FC = () => {
  const { user, verifyOtp, sendOtp, logout } = useAuth();
  const { showToast } = useToast();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [timer, setTimer] = useState(RESEND_TIMER);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, OTP_LENGTH).split('');
    if (pastedData.every(char => !isNaN(Number(char)))) {
        const newOtp = new Array(OTP_LENGTH).fill('');
        pastedData.forEach((char, index) => newOtp[index] = char);
        setOtp(newOtp);
        inputRefs.current[OTP_LENGTH - 1]?.focus();
    }
  };
  
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) {
      showToast('Please enter all 6 digits.', 'error');
      return;
    }

    setIsLoading(true);
    
    setTimeout(() => {
        const result = verifyOtp(otpString);
        if (result.success) {
            showToast('Verification successful — welcome!', 'success');
        } else {
            showToast(result.message, 'error');
            setOtp(new Array(OTP_LENGTH).fill(''));
            inputRefs.current[0]?.focus();
        }
        setIsLoading(false);
    }, 1000);
  };
  
  const handleResend = async () => {
    if (timer > 0) return;
    setIsResending(true);
    setTimer(RESEND_TIMER);
    setOtp(new Array(OTP_LENGTH).fill(''));
    inputRefs.current[0]?.focus();
    await sendOtp();
    showToast('A new OTP has been sent to your email.', 'success');
    setIsResending(false);
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-100">
      <div className="text-center p-8 bg-gray-800 rounded-2xl shadow-xl max-w-md w-full">
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-gray-400 mb-6">We’ve sent a 6-digit code to your email. Enter it below to continue.</p>
        
        <form onSubmit={handleVerify}>
          <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={el => { inputRefs.current[index] = el; }}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={e => handleInputChange(index, e.target.value)}
                onKeyDown={e => handleKeyDown(index, e)}
                className="w-12 h-14 bg-gray-700 text-white text-center text-2xl font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                disabled={isLoading}
              />
            ))}
          </div>
          
          <button
            type="submit"
            disabled={isLoading || otp.join('').length !== OTP_LENGTH}
            className="w-full bg-cyan-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:bg-cyan-500 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verifying...' : 'Verify Code'}
          </button>
        </form>

        <div className="mt-6 text-sm text-gray-400">
          Didn’t receive the code?{' '}
          <button onClick={handleResend} disabled={timer > 0 || isResending} className="font-semibold text-cyan-400 hover:underline disabled:text-gray-500 disabled:cursor-not-allowed">
            {isResending ? 'Sending...' : `Resend OTP ${timer > 0 ? `(${timer}s)` : ''}`}
          </button>
        </div>
         <button onClick={logout} className="mt-4 text-gray-500 hover:text-white transition-colors text-sm">Cancel</button>
      </div>
    </div>
  );
};

export default OtpPage;