import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Stepper } from "@/components/ui/Stepper";
import CategorySelector from "@/components/dashboard/inventory/CategorySelector";
import ProductDetailsForm from "@/components/dashboard/inventory/ProductDetailsForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

const steps = [
  { id: "category", label: "Select Category" },
  { id: "details", label: "Product Details" },
];

export default function AddProductPage({ isEditMode = false }) {
  const navigate = useNavigate();
  const { productId } = useParams();
  const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0);

  useEffect(() => {
    if (isEditMode) {
      setCurrentStep(1);
    }
  }, [isEditMode]);

  // Global Wizard State — kept in parent for persistence across steps
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setCurrentStep(1);
  };

  const handleBack = () => {
    if (currentStep > 0 && !isEditMode) {
      setCurrentStep(0);
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
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit Product" : "Add New Product"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEditMode
              ? "Update product details for your inventory."
              : "Follow the steps to add a product to your inventory."}
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
        {(selectedCategory || isEditMode) && (
          <ProductDetailsForm
            category={selectedCategory}
            onBack={handleBack}
            onSuccess={handleSuccess}
            productId={isEditMode ? productId : null}
            isEditMode={isEditMode}
          />
        )}
      </div>
    </div>
  );
}
