import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OnboardingSidebar } from '@/components/onboarding/OnboardingSidebar';
import { BusinessCategoryToggle } from '@/components/onboarding/BusinessCategoryToggle';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
    mobileVerificationSchema,
    emailVerificationSchema,
    businessDetailsSchema,
    bankDetailsSchema,
} from '@/lib/validations';
import {
    Phone,
    Mail,
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    Shield,
    MessageCircle,
    ChevronDown,
} from 'lucide-react';

export default function RegisterPage() {
    const [currentStep, setCurrentStep] = useState('mobile');
    const [completedSteps, setCompletedSteps] = useState([]);
    const [mobileVerified, setMobileVerified] = useState(false);
    const [emailVerified, setEmailVerified] = useState(false);
    const [otpSent, setOtpSent] = useState(null);
    const [businessCategory, setBusinessCategory] = useState();

    const mobileForm = useForm({
        resolver: zodResolver(mobileVerificationSchema),
        mode: 'onChange',
    });

    const emailForm = useForm({
        resolver: zodResolver(emailVerificationSchema),
        mode: 'onChange',
    });

    const businessForm = useForm({
        resolver: zodResolver(businessDetailsSchema),
        mode: 'onChange',
    });

    const bankForm = useForm({
        resolver: zodResolver(bankDetailsSchema),
        mode: 'onChange',
    });

    const handleSendOtp = async (type) => {
        setOtpSent(type);
        await new Promise(resolve => setTimeout(resolve, 1000));
    };

    const handleMobileVerify = async () => {
        setMobileVerified(true);
        setCompletedSteps(prev => [...prev, 'mobile']);
        setCurrentStep('email');
    };

    const handleEmailVerify = async () => {
        setEmailVerified(true);
        setCompletedSteps(prev => [...prev, 'email']);
        setCurrentStep('business');
    };

    const handleBusinessSubmit = async (data) => {
        console.log('Business data:', data);
        setCompletedSteps(prev => [...prev, 'business']);
        setCurrentStep('bank');
    };

    const handleBankSubmit = async (data) => {
        console.log('Bank data:', data);
        setCompletedSteps(prev => [...prev, 'bank']);
        alert('Registration Complete! Redirecting to dashboard...');
        window.location.href = '/dashboard/overview';
    };

    const goBack = () => {
        const stepOrder = ['mobile', 'email', 'business', 'bank'];
        const currentIndex = stepOrder.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(stepOrder[currentIndex - 1]);
        }
    };

    const RightSidebar = () => (
        <div className="space-y-4">
            <div className="flex flex-col gap-2">
                <Button variant="outline" size="sm" className="w-full justify-center">
                    Go to Listing →
                </Button>
                <Button variant="orange" size="sm" className="w-full justify-center">
                    GO LIVE NOW →
                </Button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-[#212121] mb-2">Do you need help?</h4>
                <p className="text-sm text-[#878787] mb-3">
                    Our team of specialists would be happy to help you setup your shop on Bukizz.
                </p>
                <p className="text-sm text-[#878787] mb-3">
                    If you would like their assistance,
                </p>
                <Button variant="outline" size="sm" className="w-full">
                    Request a Callback
                </Button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-[#2874F0]">VAKIL</span>
                    <span className="text-xs text-[#878787]">SEARCH</span>
                </div>
                <p className="text-xs text-[#878787]">
                    Get your complete GST Registration, Filing & Business License today! Vakilsearch offers seamless, error-free solutions with expert guidance.
                </p>
            </div>

            <div className="bg-gradient-to-r from-[#25D366] to-[#128C7E] rounded-lg p-4 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <MessageCircle className="w-8 h-8" />
                    <div>
                        <p className="font-semibold text-sm">Join our WhatsApp Channel</p>
                    </div>
                </div>
                <ul className="text-xs space-y-1 mb-3">
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Smart selling hacks
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Feature updates
                    </li>
                    <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        Handy tips
                    </li>
                </ul>
                <Button variant="secondary" size="sm" className="w-full">
                    Open in WhatsApp
                </Button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-[#212121] mb-3">Frequently Asked Questions</h4>
                <div className="space-y-2">
                    {[
                        'How do I update the details linked to my GSTIN?',
                        'Where will this information be used?',
                        'Can I create a seller account with a composite GSTIN?'
                    ].map((q, i) => (
                        <button key={i} className="flex items-center justify-between w-full text-left p-2 hover:bg-gray-50 rounded text-sm text-[#212121]">
                            <span>{q}</span>
                            <ChevronDown className="w-4 h-4 text-[#878787]" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );

    const BreadcrumbHeader = () => (
        <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${completedSteps.includes('mobile') ? 'bg-[#26A541]' : 'bg-[#2874F0]'
                    }`}>
                    {completedSteps.includes('mobile') ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                        <span className="text-xs text-white font-medium">1</span>
                    )}
                </div>
                <span className={`text-sm font-medium ${completedSteps.includes('mobile') ? 'text-[#26A541]' : 'text-[#212121]'}`}>
                    EMAIL & PASSWORD
                </span>
            </div>
            <div className="h-px w-8 bg-gray-300" />
            <div className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center ${completedSteps.includes('business') ? 'bg-[#26A541]' :
                    currentStep === 'business' || currentStep === 'bank' ? 'bg-[#2874F0]' : 'bg-gray-300'
                    }`}>
                    {completedSteps.includes('business') ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                        <span className="text-xs text-white font-medium">2</span>
                    )}
                </div>
                <span className={`text-sm font-medium ${completedSteps.includes('business') ? 'text-[#26A541]' :
                    currentStep === 'business' || currentStep === 'bank' ? 'text-[#212121]' : 'text-[#878787]'
                    }`}>
                    BUSINESS DETAILS
                </span>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 'mobile':
                return (
                    <div className="animate-fade-in">
                        <h1 className="text-2xl font-semibold text-[#212121] mb-6">Hello</h1>
                        <h2 className="text-lg font-medium text-[#212121] mb-4">Mobile & Email Verification</h2>

                        <form onSubmit={mobileForm.handleSubmit(handleMobileVerify)} className="space-y-5">
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-[#878787]" />
                                <Input
                                    placeholder="+91 Enter Mobile Number"
                                    disabled={mobileVerified}
                                    className="flex-1"
                                    {...mobileForm.register('mobile')}
                                    error={mobileForm.formState.errors.mobile?.message}
                                    rightElement={
                                        mobileVerified ? (
                                            <span className="flex items-center gap-1 bg-[#E8F5EA] text-[#26A541] px-3 py-1 rounded text-xs font-medium">
                                                <CheckCircle className="w-3.5 h-3.5" />
                                                Verified
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={() => handleSendOtp('mobile')}
                                                className="text-[#2874F0] text-sm font-medium hover:underline"
                                                disabled={!mobileForm.watch('mobile')}
                                            >
                                                Send OTP
                                            </button>
                                        )
                                    }
                                />
                            </div>

                            {!mobileVerified && (
                                <p className="text-sm text-[#2874F0]">
                                    Please verify your mobile number through OTP before you register
                                </p>
                            )}

                            <div className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-[#878787]" />
                                <Input
                                    type="email"
                                    placeholder="Email ID"
                                    className="flex-1"
                                    {...emailForm.register('email')}
                                    error={emailForm.formState.errors.email?.message}
                                    rightElement={
                                        <button
                                            type="button"
                                            className="text-[#2874F0] text-sm font-medium hover:underline"
                                        >
                                            Resend Email
                                        </button>
                                    }
                                />
                            </div>

                            <Input
                                type="password"
                                label="Create Password"
                                placeholder="••••••••"
                            />

                            <Input
                                type="password"
                                label="Confirm Password"
                                placeholder="••••••••"
                            />

                            <p className="text-xs text-[#878787]">
                                By continuing, I agree to Bukizz&apos;s{' '}
                                <a href="#" className="text-[#2874F0] hover:underline">Terms of Use</a>
                                {' & '}
                                <a href="#" className="text-[#2874F0] hover:underline">Privacy Policy</a>
                            </p>

                            <Button type="submit" className="w-auto">
                                Register & Continue
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                        </form>
                    </div>
                );

            case 'email':
            case 'business':
                return (
                    <div className="animate-fade-in">
                        <h1 className="text-2xl font-semibold text-[#212121] mb-2">Hello</h1>

                        <div className="mb-6">
                            <h2 className="text-lg font-medium text-[#212121] mb-4">Mobile & Email Verification</h2>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Phone className="w-5 h-5 text-[#878787]" />
                                        <span className="text-sm text-[#212121]">+918545892770</span>
                                    </div>
                                    <span className="flex items-center gap-1 bg-[#E8F5EA] text-[#26A541] px-3 py-1 rounded text-xs font-medium">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Verified
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <Mail className="w-5 h-5 text-[#878787]" />
                                        <span className="text-sm text-[#212121]">sugamtripathi0502@gmail.com</span>
                                    </div>
                                    <button className="text-[#2874F0] text-sm font-medium hover:underline">
                                        Resend Email
                                    </button>
                                </div>
                            </div>
                        </div>

                        <hr className="my-6" />

                        <form onSubmit={businessForm.handleSubmit(handleBusinessSubmit)} className="space-y-6">
                            <div>
                                <h2 className="text-lg font-medium text-[#212121] mb-4">ID & Signature Verification</h2>
                                <BusinessCategoryToggle
                                    value={businessCategory}
                                    onChange={(value) => {
                                        setBusinessCategory(value);
                                        businessForm.setValue('businessCategory', value);
                                    }}
                                    error={businessForm.formState.errors.businessCategory?.message}
                                />
                            </div>

                            {businessCategory === 'all_categories' && (
                                <div className="flex gap-3">
                                    <Input
                                        label="Enter GSTIN"
                                        placeholder="Enter GSTIN"
                                        className="flex-1"
                                        {...businessForm.register('gstin')}
                                        error={businessForm.formState.errors.gstin?.message}
                                    />
                                    <Button variant="outline" size="sm" className="mt-7">
                                        Verify GSTIN
                                    </Button>
                                </div>
                            )}

                            {businessCategory === 'only_books' && (
                                <>
                                    <div className="flex gap-3">
                                        <Input
                                            label="Enter PAN Number"
                                            placeholder="Enter PAN Number"
                                            className="flex-1"
                                            {...businessForm.register('panNumber')}
                                            error={businessForm.formState.errors.panNumber?.message}
                                        />
                                        <Button variant="outline" size="sm" className="mt-7">
                                            Verify
                                        </Button>
                                    </div>
                                    <p className="text-xs text-[#878787]">
                                        PAN is required to sell books on Bukizz.
                                    </p>
                                    <p className="text-xs text-[#878787]">
                                        PAN & Business Details are required to sell books on Bukizz.
                                    </p>
                                </>
                            )}

                            {businessCategory && (
                                <>
                                    <Input
                                        label="Enter Business Name"
                                        placeholder="Enter Business Name"
                                        {...businessForm.register('businessName')}
                                        error={businessForm.formState.errors.businessName?.message}
                                    />

                                    <Input
                                        label="Enter Business Address"
                                        placeholder="Enter Business Address"
                                        {...businessForm.register('addressLine1')}
                                        error={businessForm.formState.errors.addressLine1?.message}
                                    />

                                    <Input
                                        label="Enter Pincode"
                                        placeholder="Enter Pincode"
                                        {...businessForm.register('pincode')}
                                        error={businessForm.formState.errors.pincode?.message}
                                    />

                                    <div>
                                        <p className="text-sm text-[#878787] mb-2">* Upload your address as a single file</p>
                                        <div className="flex items-center gap-3">
                                            <button type="button" className="flex items-center gap-2 text-[#2874F0] text-sm font-medium hover:underline">
                                                📎 Upload
                                            </button>
                                            <span className="text-xs text-[#878787]">Max File Size: 20 MB</span>
                                        </div>
                                    </div>

                                    <Button type="submit">
                                        Save
                                    </Button>
                                </>
                            )}
                        </form>
                    </div>
                );

            case 'bank':
                return (
                    <div className="animate-fade-in">
                        <h2 className="text-lg font-medium text-[#212121] mb-6">Bank Account Details</h2>

                        <form onSubmit={bankForm.handleSubmit(handleBankSubmit)} className="space-y-5">
                            <Input
                                label="Account Holder Name"
                                placeholder="As per bank records"
                                {...bankForm.register('accountHolderName')}
                                error={bankForm.formState.errors.accountHolderName?.message}
                            />

                            <Input
                                label="Account Number"
                                placeholder="Enter account number"
                                type="password"
                                {...bankForm.register('accountNumber')}
                                error={bankForm.formState.errors.accountNumber?.message}
                            />

                            <Input
                                label="Confirm Account Number"
                                placeholder="Re-enter account number"
                                {...bankForm.register('confirmAccountNumber')}
                                error={bankForm.formState.errors.confirmAccountNumber?.message}
                            />

                            <Input
                                label="IFSC Code"
                                placeholder="HDFC0001234"
                                {...bankForm.register('ifscCode')}
                                error={bankForm.formState.errors.ifscCode?.message}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Bank Name"
                                    placeholder="Bank name"
                                    {...bankForm.register('bankName')}
                                    error={bankForm.formState.errors.bankName?.message}
                                />
                                <Input
                                    label="Branch Name"
                                    placeholder="Branch name"
                                    {...bankForm.register('branchName')}
                                    error={bankForm.formState.errors.branchName?.message}
                                />
                            </div>

                            <div className="flex items-start gap-3 p-4 rounded-lg bg-[#E8F0FE]">
                                <Shield className="w-5 h-5 text-[#2874F0] flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-[#212121]">
                                    Your bank details are encrypted and securely stored. We use industry-standard security practices.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button type="button" variant="outline" onClick={goBack}>
                                    <ArrowLeft className="w-4 h-4" />
                                    Back
                                </Button>
                                <Button type="submit" variant="success">
                                    Complete Registration
                                    <CheckCircle className="w-4 h-4" />
                                </Button>
                            </div>
                        </form>
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-[#F1F3F6]">
            <div className="hidden lg:block w-64 flex-shrink-0">
                <div className="fixed w-64 h-full">
                    <OnboardingSidebar
                        currentStep={currentStep}
                        completedSteps={completedSteps}
                    />
                </div>
            </div>

            <div className="flex-1 p-6 lg:p-8">
                <div className="max-w-4xl mx-auto">
                    <BreadcrumbHeader />

                    <div className="grid lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm">
                            {renderStepContent()}
                        </div>

                        <div className="hidden lg:block">
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

