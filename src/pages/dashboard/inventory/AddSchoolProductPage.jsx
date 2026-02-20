import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Stepper } from "@/components/ui/Stepper";
import ProductDetailsForm from "@/components/dashboard/inventory/ProductDetailsForm";
import { productService } from "@/services/productService";
import { schoolService } from "@/services/schoolService";
import { useWarehouse } from "@/context/WarehouseContext";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  Check,
  Loader2,
  BookOpen,
  Shirt,
  Pencil,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const SUBCATEGORY_ICONS = {
  bookset: BookOpen,
  uniform: Shirt,
  stationary: Pencil,
  stationery: Pencil,
};

const SUBCATEGORY_COLORS = {
  bookset: "bg-blue-50 text-blue-600 border-blue-200",
  uniform: "bg-violet-50 text-violet-600 border-violet-200",
  stationary: "bg-amber-50 text-amber-600 border-amber-200",
  stationery: "bg-amber-50 text-amber-600 border-amber-200",
};

const steps = [
  { id: "category", label: "Select Category" },
  { id: "details", label: "Product Details" },
];

export default function AddSchoolProductPage({ isEditMode = false }) {
  const { schoolId, productId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { activeWarehouse } = useWarehouse();

  const [schoolName, setSchoolName] = useState(
    location.state?.schoolName || "School",
  );
  const allowedTypes = location.state?.allowedTypes || null;

  const [currentStep, setCurrentStep] = useState(isEditMode ? 1 : 0);

  useEffect(() => {
    if (isEditMode) {
      setCurrentStep(1);
    }
  }, [isEditMode]);

  useEffect(() => {
    // If we're editing but didn't come from a page with schoolName in state, fetch the school name
    if (isEditMode && schoolId && schoolName === "School") {
      schoolService
        .getSchoolById(schoolId)
        .then((school) => {
          if (school && school.name) {
            setSchoolName(school.name);
          }
        })
        .catch((err) => console.error("Could not fetch school details:", err));
    }
  }, [isEditMode, schoolId, schoolName]);
  const [loading, setLoading] = useState(true);
  const [schoolSubcategories, setSchoolSubcategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Fetch "School" root category and its children on mount
  useEffect(() => {
    const fetchSchoolCategories = async () => {
      setLoading(true);
      try {
        // Step 1: Get root categories, find "School"
        const rootData = await productService.getCategories({});
        const rootCats = rootData?.categories || rootData || [];
        const schoolRoot = rootCats.find(
          (c) => c.name?.toLowerCase() === "school",
        );

        if (!schoolRoot) {
          console.error("School root category not found");
          setSchoolSubcategories([]);
          setLoading(false);
          return;
        }

        // Step 2: Get subcategories of School
        const subData = await productService.getCategories({
          parentId: schoolRoot.id,
        });
        const subCats = subData?.categories || subData || [];

        setSchoolSubcategories(subCats);
      } catch (error) {
        console.error("Failed to fetch school categories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchoolCategories();
  }, []);

  // Filter subcategories by allowedTypes
  const filteredSubcategories = useMemo(() => {
    if (!allowedTypes || allowedTypes.length === 0) return schoolSubcategories;
    return schoolSubcategories.filter((cat) =>
      allowedTypes.includes(cat.name?.toLowerCase()),
    );
  }, [schoolSubcategories, allowedTypes]);

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
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
    navigate(`/dashboard/inventory/schools/${schoolId}`, {
      state: { allowedTypes },
    });
  };

  // Derive city from warehouse
  const warehouseCity =
    activeWarehouse?.address?.city ||
    activeWarehouse?.city ||
    activeWarehouse?.address ||
    "";

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {isEditMode ? "Edit School Product" : "Add School Product"}
          </h1>
          <p className="text-sm text-slate-500">
            {isEditMode ? "Updating product for " : "Adding product for "}
            <span className="font-medium text-blue-600">{schoolName}</span>
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

      {/* Step 1: Category Selector */}
      <div className={currentStep === 0 ? "block" : "hidden"}>
        <div className="min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-8">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-blue-50 mb-4">
                <GraduationCap className="h-7 w-7 text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">
                Choose Product Type
              </h2>
              <p className="text-sm text-slate-500">
                Select the type of school product you want to add for{" "}
                <strong>{schoolName}</strong>
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500 mb-3" />
                <p className="text-sm text-slate-500">Loading categories…</p>
              </div>
            ) : filteredSubcategories.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-slate-500 font-medium mb-2">
                  No allowed categories found
                </p>
                <p className="text-sm text-slate-400">
                  You may not have permission to add products in any school
                  category.
                </p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => navigate(-1)}
                >
                  Go Back
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredSubcategories.map((cat) => {
                  const key = cat.name?.toLowerCase();
                  const IconComp = SUBCATEGORY_ICONS[key] || BookOpen;
                  const colorClasses =
                    SUBCATEGORY_COLORS[key] ||
                    "bg-slate-50 text-slate-600 border-slate-200";

                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat)}
                      className={cn(
                        "group flex flex-col items-center gap-3 rounded-xl border-2 p-6 transition-all hover:shadow-md hover:-translate-y-0.5",
                        selectedCategory?.id === cat.id
                          ? "border-blue-500 bg-blue-50/50 ring-2 ring-blue-500/20"
                          : "border-slate-200 bg-white hover:border-blue-300",
                      )}
                    >
                      <div
                        className={cn(
                          "w-14 h-14 rounded-xl flex items-center justify-center border transition-colors",
                          selectedCategory?.id === cat.id
                            ? "bg-blue-100 text-blue-600 border-blue-200"
                            : colorClasses,
                        )}
                      >
                        <IconComp className="h-7 w-7" />
                      </div>
                      <div className="text-center">
                        <p className="font-semibold text-slate-900 capitalize">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      {selectedCategory?.id === cat.id && (
                        <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center">
                          <Check className="h-4 w-4" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Step 2: Product Details Form */}
      <div className={currentStep === 1 ? "block" : "hidden"}>
        {(selectedCategory || isEditMode) && (
          <ProductDetailsForm
            category={selectedCategory}
            onBack={handleBack}
            onSuccess={handleSuccess}
            // School-specific props
            schoolId={schoolId}
            schoolName={schoolName}
            schoolProductType={selectedCategory?.name?.toLowerCase()}
            prefilledCity={
              typeof warehouseCity === "string" ? warehouseCity : ""
            }
            productId={isEditMode ? productId : null}
            isEditMode={isEditMode}
          />
        )}
      </div>
    </div>
  );
}
