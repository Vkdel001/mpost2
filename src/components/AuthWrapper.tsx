import React, { useState, useEffect } from 'react';
import { LoginForm } from './LoginForm';
import { OTPVerification } from './OTPVerification';
import { authService } from '../services/authService';

interface AuthWrapperProps {
  children: React.ReactNode;
}

type AuthStep = 'login' | 'otp-verification';

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>('login');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Check authentication status on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user?.isAuthenticated) {
      setIsAuthenticated(true);
    }
  }, []);

  // Timer for OTP expiry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (authStep === 'otp-verification' && email) {
      interval = setInterval(() => {
        const remaining = authService.getOTPTimeRemaining(email);
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          clearInterval(interval);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [authStep, email]);

  const handleEmailSubmit = async (emailAddress: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await authService.sendOTP(emailAddress);
      
      if (success) {
        setEmail(emailAddress);
        setAuthStep('otp-verification');
        setTimeRemaining(300); // 5 minutes
      } else {
        setError('Failed to send OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while sending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPVerify = (otp: string) => {
    setIsLoading(true);
    setError(null);

    const result = authService.verifyOTP(email, otp);
    
    if (result.success) {
      authService.login(email);
      setIsAuthenticated(true);
    } else {
      setError(result.message);
    }
    
    setIsLoading(false);
  };

  const handleResendOTP = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const success = await authService.sendOTP(email);
      
      if (success) {
        setTimeRemaining(300); // Reset to 5 minutes
        setError(null);
      } else {
        setError('Failed to resend OTP. Please try again.');
      }
    } catch (err) {
      setError('An error occurred while resending OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setAuthStep('login');
    setEmail('');
    setError(null);
    setTimeRemaining(0);
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setAuthStep('login');
    setEmail('');
    setError(null);
    setTimeRemaining(0);
  };

  if (!isAuthenticated) {
    if (authStep === 'login') {
      return (
        <LoginForm
          onEmailSubmit={handleEmailSubmit}
          isLoading={isLoading}
          error={error}
        />
      );
    }

    if (authStep === 'otp-verification') {
      return (
        <OTPVerification
          email={email}
          onOTPVerify={handleOTPVerify}
          onResendOTP={handleResendOTP}
          onBack={handleBack}
          isLoading={isLoading}
          error={error}
          timeRemaining={timeRemaining}
        />
      );
    }
  }

  // Pass logout function to children through context or props
  return (
    <div>
      {React.cloneElement(children as React.ReactElement, { onLogout: handleLogout })}
    </div>
  );
};