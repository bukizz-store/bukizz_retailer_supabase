import React, { useEffect, useCallback } from "react";
import useSchoolStore from "@/store/schoolStore";
import { useWarehouse } from "@/context/WarehouseContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import {
  X,
  Search,
  GraduationCap,
  MapPin,
  ChevronRight,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

const PRODUCT_CATEGORIES = [
  { label: "Bookset", value: "bookset" },
  { label: "Uniform", value: "uniform" },
  { label: "Stationary", value: "stationary" },
];

/**
 * SchoolRequestModal
 *
 * A self-contained modal that:
 *  1. Reads the active warehouse's city from WarehouseContext
 *  2. Fetches schools in that city via the schoolStore
 *  3. Lets the retailer pick a school & product categories
 *  4. Submits the access request
 *
 * Usage:
 *   <SchoolRequestModal onSuccess={() => { ... }} />
 *
 * The modal's open/close state is driven by schoolStore.isRequestModalOpen.
 */
export default function SchoolRequestModal({ onSuccess }) {
  const { activeWarehouse } = useWarehouse();

  const {
    // Modal state
    isRequestModalOpen,
    closeRequestModal,
    // Schools
    schools,
    isLoadingSchools,
    schoolsError,
    searchQuery,
    searchSchools,
    // Selection
    selectedSchoolId,
    selectSchool,
    selectedCategories,
    toggleCategory,
    // Submission
    isSubmitting,
    submitError,
    submitSchoolAccessRequest,
  } = useSchoolStore();

  // Debounced search
  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      searchSchools(value);
    },
    [searchSchools],
  );

  // Handle submit
  const handleSubmit = async () => {
    const result = await submitSchoolAccessRequest(activeWarehouse?.id);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  if (!isRequestModalOpen) return null;

  const warehouseCity =
    activeWarehouse?.address?.city || activeWarehouse?.city || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeRequestModal}
      />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 rounded-t-2xl">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Request School Access
            </h2>
            {warehouseCity && (
              <p className="mt-0.5 text-sm text-slate-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                Showing schools in{" "}
                <span className="font-medium text-slate-700">
                  {warehouseCity}
                </span>
              </p>
            )}
          </div>
          <button
            onClick={closeRequestModal}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Search for a school
            </label>
            <Input
              placeholder="Search by school name or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              icon={<Search className="h-4 w-4" />}
            />
          </div>

          {/* Error State */}
          {schoolsError && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{schoolsError}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoadingSchools && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <p className="mt-3 text-sm text-slate-500">
                Loading schools in {warehouseCity}…
              </p>
            </div>
          )}

          {/* School List */}
          {!isLoadingSchools && !schoolsError && (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {schools.length === 0 ? (
                <div className="py-8 text-center">
                  <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No schools found
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {searchQuery
                      ? `No results for "${searchQuery}" in ${warehouseCity}`
                      : `No schools available in ${warehouseCity}`}
                  </p>
                </div>
              ) : (
                schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => selectSchool(school.id)}
                    className={cn(
                      "w-full flex items-start gap-4 rounded-xl border-2 p-4 text-left transition-all",
                      selectedSchoolId === school.id
                        ? "border-blue-600 bg-blue-50"
                        : "border-slate-200 hover:border-blue-300",
                    )}
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-violet-100">
                      <GraduationCap className="h-6 w-6 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900">
                        {school.name}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        <p className="text-sm text-slate-500 truncate">
                          {school.city || school.address?.city}
                          {(school.state || school.address?.state) &&
                            `, ${school.state || school.address?.state}`}
                          {(school.postalCode ||
                            school.address?.postalCode ||
                            school.pincode) &&
                            ` - ${school.postalCode || school.address?.postalCode || school.pincode}`}
                        </p>
                      </div>
                      {school.board && (
                        <span className="mt-1.5 inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                          <GraduationCap className="h-3 w-3" />
                          {school.board}
                        </span>
                      )}
                    </div>
                    {selectedSchoolId === school.id && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
                        <Check className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                ))
              )}
            </div>
          )}

          {/* Category Selection */}
          {selectedSchoolId && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Select product types you want to sell
              </label>
              <div className="flex flex-wrap gap-2">
                {PRODUCT_CATEGORIES.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => toggleCategory(category.value)}
                    className={cn(
                      "rounded-full px-4 py-2 text-sm font-medium transition-colors border",
                      selectedCategories.includes(category.value)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-slate-600 border-slate-300 hover:border-blue-300",
                    )}
                  >
                    {selectedCategories.includes(category.value) && (
                      <Check className="h-3.5 w-3.5 inline-block mr-1" />
                    )}
                    {category.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Error */}
          {submitError && (
            <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{submitError}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-slate-200 bg-slate-50 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={closeRequestModal}>
              Cancel
            </Button>
            <Button
              disabled={
                !selectedSchoolId ||
                selectedCategories.length === 0 ||
                isSubmitting
              }
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  Submit Request
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
