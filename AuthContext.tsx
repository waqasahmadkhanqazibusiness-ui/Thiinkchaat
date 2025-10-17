import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { User } from './types';

interface OtpState {
  value: string;
  expiresAt: number;
  attempts: number;
}

interface AuthContextType {
  user: User | null;
  isVerified: boolean;
  otpSent: boolean;
  loginWithGoogle: () => void;
  loginWithEmail: (email: string) => void;
  sendOtp: () => Promise<string>;
  verifyOtp: (otp: string) => { success: boolean; message: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const MOCK_USER_GOOGLE: User = {
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Alex%20Johnson`,
};

const OTP_EXPIRY_MINUTES = 5;
const MAX_OTP_ATTEMPTS = 3;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpState, setOtpState] = useState<OtpState | null>(null);

  useEffect(() => {
    try {
      const storedState = localStorage.getItem('authState');
      if (storedState) {
        const { user: storedUser, isVerified: storedIsVerified, otpSent: storedOtpSent, otpState: storedOtpState } = JSON.parse(storedState);
        if (storedUser) {
          setUser(storedUser);
          setIsVerified(storedIsVerified);
          setOtpSent(storedOtpSent);
          setOtpState(storedOtpState);
        }
      }
    } catch (error) {
      console.error("Failed to parse auth state from localStorage", error);
      localStorage.removeItem('authState');
    }
  }, []);
  
  const updateAndPersistState = (newState: { user: User | null, isVerified: boolean, otpSent: boolean, otpState: OtpState | null }) => {
    setUser(newState.user);
    setIsVerified(newState.isVerified);
    setOtpSent(newState.otpSent);
    setOtpState(newState.otpState);
    localStorage.setItem('authState', JSON.stringify(newState));
  };

  const generateAndSetOtp = () => {
    const newOtpValue = String(Math.floor(100000 + Math.random() * 900000));
    const newOtpState: OtpState = {
      value: newOtpValue,
      expiresAt: Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000,
      attempts: 0,
    };
    setOtpState(newOtpState);
    console.log(`(For Testing) OTP Sent to ${user?.email || 'new user'}: ${newOtpValue}`);
    return newOtpState;
  }

  const loginWithGoogle = () => {
    updateAndPersistState({ user: MOCK_USER_GOOGLE, isVerified: false, otpSent: false, otpState: null });
  };
  
  const loginWithEmail = (email: string) => {
    const emailUser: User = {
      name: email.split('@')[0],
      email: email,
    };
    const newOtpState = generateAndSetOtp();
    updateAndPersistState({ user: emailUser, isVerified: false, otpSent: true, otpState: newOtpState });
  };

  const sendOtp = async (): Promise<string> => {
    return new Promise(resolve => {
      setTimeout(() => {
        const newOtpState = generateAndSetOtp();
        updateAndPersistState({ user, isVerified: false, otpSent: true, otpState: newOtpState });
        resolve(newOtpState.value);
      }, 1000);
    });
  };

  const verifyOtp = (otp: string): { success: boolean; message: string } => {
    if (!otpState) {
      return { success: false, message: 'No OTP found. Please request one.' };
    }

    if (Date.now() > otpState.expiresAt) {
      return { success: false, message: 'OTP has expired. Please request a new one.' };
    }

    if (otpState.attempts >= MAX_OTP_ATTEMPTS) {
        return { success: false, message: 'Too many failed attempts. Please request a new OTP.' };
    }

    if (otp === otpState.value) {
      updateAndPersistState({ user, isVerified: true, otpSent: true, otpState: null });
      return { success: true, message: 'Verification successful!' };
    } else {
        const newOtpState = { ...otpState, attempts: otpState.attempts + 1 };
        setOtpState(newOtpState);
        updateAndPersistState({user, isVerified, otpSent, otpState: newOtpState});
        const remainingAttempts = MAX_OTP_ATTEMPTS - newOtpState.attempts;
        return { success: false, message: `Invalid OTP. You have ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} left.` };
    }
  };

  const logout = () => {
    updateAndPersistState({ user: null, isVerified: false, otpSent: false, otpState: null });
    localStorage.removeItem('authState');
  };

  return (
    <AuthContext.Provider value={{ user, isVerified, otpSent, loginWithGoogle, loginWithEmail, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};