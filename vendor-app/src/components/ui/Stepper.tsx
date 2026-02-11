'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export interface Step {
    id: string;
    label: string;
    description?: string;
}

interface StepperProps {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepIndex: number) => void;
    className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
    return (
        <div className={cn("w-full", className)}>
            <div className="flex items-center justify-between">
                {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;
                    const isClickable = onStepClick && index <= currentStep;

                    return (
                        <React.Fragment key={step.id}>
                            {/* Step Circle and Label */}
                            <div className="flex flex-col items-center">
                                <button
                                    type="button"
                                    onClick={() => isClickable && onStepClick(index)}
                                    disabled={!isClickable}
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all duration-300",
                                        isCompleted && "border-emerald-500 bg-emerald-500 text-white",
                                        isActive && "border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-200",
                                        !isCompleted && !isActive && "border-slate-300 bg-white text-slate-400",
                                        isClickable && "cursor-pointer hover:scale-105"
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-5 w-5" />
                                    ) : (
                                        index + 1
                                    )}
                                </button>
                                <div className="mt-2 text-center">
                                    <p className={cn(
                                        "text-sm font-medium",
                                        isActive ? "text-blue-600" : isCompleted ? "text-emerald-600" : "text-slate-500"
                                    )}>
                                        {step.label}
                                    </p>
                                    {step.description && (
                                        <p className="mt-0.5 text-xs text-slate-400">
                                            {step.description}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Connector Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 px-4">
                                    <div className={cn(
                                        "h-0.5 w-full transition-colors duration-300",
                                        index < currentStep ? "bg-emerald-500" : "bg-slate-200"
                                    )} />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
