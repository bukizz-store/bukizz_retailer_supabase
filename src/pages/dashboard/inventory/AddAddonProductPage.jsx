import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ProductDetailsForm from "@/components/dashboard/inventory/ProductDetailsForm";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function AddAddonProductPage({ isEditMode = false }) {
  const navigate = useNavigate();
  const { productId } = useParams();

  const handleBack = () => {
    navigate(-1);
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
            {isEditMode ? "Edit Addon Product" : "Add New Addon Product"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEditMode
              ? "Update addon product details."
              : "Create an addon product that can be attached to school or store variants."}
          </p>
        </div>
      </div>

      <div className="block">
        <ProductDetailsForm
          category={null}
          onBack={handleBack}
          onSuccess={handleSuccess}
          productId={isEditMode ? productId : null}
          isEditMode={isEditMode}
          isAddon={true}
        />
      </div>
    </div>
  );
}
