'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { BookOpen, Mail, Lock, ArrowRight } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Please enter a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginData = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginData) => {
        setLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('Login data:', data);
        setLoading(false);
        router.push('/dashboard/overview');
    };

    return (
        <div className="min-h-screen flex">
            {/* Left side - Decorative */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-violet-950 to-slate-900 relative overflow-hidden">
                {/* Background elements */}
                <div className="absolute inset-0">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-violet-500/20 rounded-full blur-3xl" />
                    <div className="absolute bottom-20 -left-20 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col justify-center p-12 text-white">
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <span className="text-2xl font-bold">Bukizz Vendor</span>
                    </div>

                    <h1 className="text-4xl font-bold mb-6">
                        Welcome back to your{' '}
                        <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                            Seller Dashboard
                        </span>
                    </h1>

                    <p className="text-lg text-slate-400 mb-8">
                        Manage your products, track orders, and grow your school supplies business.
                    </p>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Active Vendors', value: '500+' },
                            { label: 'Schools Connected', value: '1,200+' },
                            { label: 'Orders Fulfilled', value: '50K+' },
                            { label: 'Satisfaction Rate', value: '98%' },
                        ].map((stat, index) => (
                            <div key={index} className="p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                                <p className="text-2xl font-bold text-white">{stat.value}</p>
                                <p className="text-sm text-slate-400">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right side - Login form */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white dark:bg-slate-950">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white">Bukizz</span>
                    </div>

                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                            Sign in to your account
                        </h2>
                        <p className="text-slate-500 dark:text-slate-400">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@business.com"
                            icon={<Mail className="w-5 h-5" />}
                            {...register('email')}
                            error={errors.email?.message}
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                icon={<Lock className="w-5 h-5" />}
                                {...register('password')}
                                error={errors.password?.message}
                            />
                            <div className="mt-2 flex justify-end">
                                <Link
                                    href="/forgot-password"
                                    className="text-sm text-violet-600 hover:text-violet-700 dark:text-violet-400"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" size="lg" loading={loading}>
                            Sign In
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
                        Don&apos;t have an account?{' '}
                        <Link
                            href="/register"
                            className="text-violet-600 hover:text-violet-700 dark:text-violet-400 font-medium"
                        >
                            Register as a vendor
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
