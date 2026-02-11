'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Package, BookOpen, Check } from 'lucide-react';
import { BusinessCategory } from '@/types';

interface BusinessCategoryToggleProps {
    value: BusinessCategory | undefined;
    onChange: (value: BusinessCategory) => void;
    error?: string;
}

export function BusinessCategoryToggle({ value, onChange, error }: BusinessCategoryToggleProps) {
    const categories = [
        {
            id: 'all_categories' as BusinessCategory,
            title: 'All Categories',
            subtitle: '(GSTIN is mandatory)',
            icon: Package,
        },
        {
            id: 'only_books' as BusinessCategory,
            title: 'Only Books',
            subtitle: '(PAN is mandatory)',
            icon: BookOpen,
        },
    ];

    return (
        <div>
            <label className="block text-sm font-medium text-[#212121] mb-3">
                What are you looking to sell on Bukizz?
            </label>
            <div className="flex gap-4">
                {categories.map((category) => {
                    const isSelected = value === category.id;
                    const Icon = category.icon;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => onChange(category.id)}
                            className={cn(
                                "relative flex items-center gap-3 px-5 py-4 rounded-lg border-2 text-left transition-all duration-200 flex-1",
                                isSelected
                                    ? "border-[#2874F0] bg-[#E8F0FE]"
                                    : "border-gray-200 bg-white hover:border-gray-300"
                            )}
                        >
                            {/* Selection indicator */}
                            {isSelected && (
                                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#2874F0] flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}

                            {/* Icon */}
                            <div className={cn(
                                "w-10 h-10 rounded-lg flex items-center justify-center",
                                isSelected ? "bg-[#2874F0]" : "bg-gray-100"
                            )}>
                                <Icon className={cn(
                                    "w-5 h-5",
                                    isSelected ? "text-white" : "text-gray-500"
                                )} />
                            </div>

                            {/* Text */}
                            <div>
                                <p className={cn(
                                    "font-medium text-sm",
                                    isSelected ? "text-[#2874F0]" : "text-[#212121]"
                                )}>
                                    {category.title}
                                </p>
                                <p className="text-xs text-[#878787]">
                                    {category.subtitle}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </div>
            {error && (
                <p className="mt-2 text-sm text-[#FF6161] flex items-center gap-1">
                    <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    );
}
