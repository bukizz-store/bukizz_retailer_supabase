import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export const EmailOtpModal = ({ isOpen, onClose, email, onVerify, onResend, isLoading, error }) => {
    const [otp, setOtp] = useState('');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
            <div className="bg-white rounded-lg p-6 w-full max-w-sm mx-4 relative shadow-xl">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                >
                    <X className="w-5 h-5" />
                </button>

                <h3 className="text-xl font-semibold mb-2 text-[#212121]">Verify Email</h3>
                <p className="text-sm text-gray-600 mb-6">
                    Enter the 6-digit code sent to <br /><strong className="text-[#212121]">{email}</strong>
                </p>

                <div className="space-y-4">
                    <Input
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="text-center text-lg tracking-widest"
                        maxLength={6}
                    />
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <Button
                        className="w-full"
                        onClick={() => onVerify(otp)}
                        disabled={isLoading || otp.length !== 6}
                    >
                        {isLoading ? 'Verifying...' : 'Verify OTP'}
                    </Button>

                    <div className="text-center mt-4">
                        <p className="text-sm text-gray-500 mb-2">Didn&apos;t receive the code?</p>
                        <button
                            className="text-[#2874F0] text-sm font-medium hover:underline disabled:opacity-50"
                            onClick={onResend}
                            disabled={isLoading}
                        >
                            Resend OTP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
