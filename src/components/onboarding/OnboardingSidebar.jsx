import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

const steps = [
  {
    id: "mobile",
    title: "Mobile & Email Verification",
    description: "Verify your contact details",
    substeps: ["Mobile Verification", "Email Verification"],
  },
  {
    id: "email",
    title: "ID & Signature Verification",
    description: "Upload your documents",
    substeps: ["ID Verification", "Signature Verification"],
  },
  {
    id: "business",
    title: "Store & Pickup Details",
    description: "Add your business information",
    substeps: ["Display Name", "Pickup Address"],
  },
];

export function OnboardingSidebar({ currentStep, completedSteps }) {
  const completionPercentage = Math.round(
    (completedSteps.length / steps.length) * 100,
  );

  return (
    <div className="h-full bg-white border-r border-gray-200 p-6 flex flex-col">
      {/* Logo */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          <img src="/logo.svg" alt="Bukizz Logo" className="h-8 w-auto" />
        </div>
      </div>

      {/* Progress Card */}
      <div className="bg-[#FFF8E1] rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#212121]">
            Your onboarding
          </span>
          <span className="text-xs text-[#878787]">completion status</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14">
            <svg className="w-full h-full -rotate-90">
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="#E0E0E0"
                strokeWidth="4"
                fill="none"
              />
              <circle
                cx="28"
                cy="28"
                r="24"
                stroke="url(#progress-gradient)"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${completionPercentage * 1.5} 150`}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient
                  id="progress-gradient"
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                >
                  <stop offset="0%" stopColor="#FF9F00" />
                  <stop offset="100%" stopColor="#FFE500" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-[#FF9F00]">
                {completionPercentage}%
              </span>
            </div>
          </div>
          <div className="h-2 flex-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF9F00] to-[#FFE500] rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex-1 overflow-y-auto">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          const stepIndex = steps.findIndex((s) => s.id === currentStep);
          const isPast = index < stepIndex;

          return (
            <div key={step.id} className="mb-4">
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium transition-all",
                    isCompleted || isPast
                      ? "bg-[#26A541] text-white"
                      : isCurrent
                        ? "bg-[#2874F0] text-white ring-2 ring-[#2874F0]/20"
                        : "bg-gray-200 text-gray-500",
                  )}
                >
                  {isCompleted || isPast ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    index + 1
                  )}
                </div>
                <div className="flex-1">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent
                        ? "text-[#212121]"
                        : isCompleted || isPast
                          ? "text-[#26A541]"
                          : "text-[#878787]",
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>

              {step.substeps && (
                <div className="ml-9 mt-2 space-y-1.5">
                  {step.substeps.map((substep, subIndex) => (
                    <div key={subIndex} className="flex items-center gap-2">
                      <div
                        className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center",
                          isCompleted || isPast
                            ? "bg-[#26A541]"
                            : isCurrent && subIndex === 0
                              ? "bg-[#2874F0]"
                              : "bg-transparent border border-gray-300",
                        )}
                      >
                        {(isCompleted ||
                          isPast ||
                          (isCurrent && subIndex === 0)) && (
                          <Check className="w-2.5 h-2.5 text-white" />
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-xs",
                          isCompleted || isPast
                            ? "text-[#26A541]"
                            : isCurrent && subIndex === 0
                              ? "text-[#2874F0]"
                              : "text-[#ABABAB]",
                        )}
                      >
                        {substep}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-xs text-[#878787]">
          Need help?{" "}
          <a href="#" className="text-[#2874F0] hover:underline">
            Contact Support
          </a>
        </p>
      </div>
    </div>
  );
}
