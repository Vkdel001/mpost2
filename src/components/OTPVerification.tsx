import React, { useState, useEffect } from 'react';
import { Shield, ArrowLeft, RefreshCw, Clock } from 'lucide-react';

interface OTPVerificationProps {
  email: string;
  onOTPVerify: (otp: string) => void;
  onResendOTP: () => void;
  onBack: () => void;
  isLoading: boolean;
  error: string | null;
  timeRemaining: number;
}

export const OTPVerification: React.FC<OTPVerificationProps> = ({
  email,
  onOTPVerify,
  onResendOTP,
  onBack,
  isLoading,
  error,
  timeRemaining
}) => {
  const [otp, setOTP] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp.trim()) {
      setOtpError('Please enter the OTP');
      return;
    }

    if (otp.length !== 6) {
      setOtpError('OTP must be 6 digits');
      return;
    }

    if (!/^\d+$/.test(otp)) {
      setOtpError('OTP must contain only numbers');
      return;
    }

    setOtpError('');
    onOTPVerify(otp);
  };

  const handleOTPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setOTP(value);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const canResend = timeRemaining === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-600 to-blue-600 rounded-2xl mb-6">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Verify Your Email
          </h1>
          <p className="text-gray-600">
            We've sent a 6-digit code to
          </p>
          <p className="text-blue-600 font-medium">{email}</p>
        </div>

        {/* OTP Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Enter OTP Code
              </label>
              <input
                type="text"
                id="otp"
                value={otp}
                onChange={handleOTPChange}
                placeholder="000000"
                className="w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isLoading}
                maxLength={6}
              />
              {otpError && (
                <p className="text-red-600 text-sm mt-1">{otpError}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Timer */}
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {timeRemaining > 0 ? (
                <span>Code expires in {formatTime(timeRemaining)}</span>
              ) : (
                <span className="text-red-500">Code has expired</span>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || timeRemaining === 0}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white py-3 px-4 rounded-lg font-medium hover:from-emerald-700 hover:to-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Verifying...
                </div>
              ) : (
                'Verify OTP'
              )}
            </button>
          </form>

          {/* Resend OTP */}
          <div className="mt-4 text-center">
            <button
              onClick={onResendOTP}
              disabled={!canResend || isLoading}
              className={`inline-flex items-center text-sm font-medium transition-colors ${
                canResend && !isLoading
                  ? 'text-blue-600 hover:text-blue-800'
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {canResend ? 'Resend OTP' : 'Resend available after expiry'}
            </button>
          </div>

          {/* Back button */}
          <div className="mt-4 text-center">
            <button
              onClick={onBack}
              disabled={isLoading}
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to email
            </button>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-6 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            <strong>OTP:</strong> Check your email to see your OTP code.
          </p>
        </div>
      </div>
    </div>
  );
};