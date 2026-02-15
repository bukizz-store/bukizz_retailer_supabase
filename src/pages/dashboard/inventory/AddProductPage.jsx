import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stepper } from "@/components/ui/Stepper";
import CategorySelector from "@/components/dashboard/inventory/CategorySelector";
import ProductDetailsForm from "@/components/dashboard/inventory/ProductDetailsForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  { id: "category", label: "Select Category" },
  { id: "details", label: "Product Details" },
];

export default function AddProductPage() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);

  // Global Wizard State — kept in parent for persistence across steps
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate(-1);
    }
  };

  const handleSuccess = () => {
    navigate("/dashboard/inventory/general");
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Product</h1>
          <p className="text-sm text-slate-500">
            Follow the steps to add a product to your inventory.
          </p>
        </div>
      </div>

      {/* Stepper */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          onStepClick={(step) => {
            if (step < currentStep) setCurrentStep(step);
          }}
        />
      </div>

      {/* Step Content — conditionally rendered, not unmounted, for state persistence */}
      <div className={currentStep === 0 ? "block" : "hidden"}>
        <div className="min-h-[600px] bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <CategorySelector onSelect={handleCategorySelect} />
        </div>
      </div>

      <div className={currentStep === 1 ? "block" : "hidden"}>
        {selectedCategory && (
          <ProductDetailsForm
            category={selectedCategory}
            onBack={handleBack}
            onSuccess={handleSuccess}
          />
        )}
      </div>
    </div>
  );
}
