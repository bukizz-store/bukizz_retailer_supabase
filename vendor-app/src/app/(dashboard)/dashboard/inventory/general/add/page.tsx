'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Stepper, Step } from '@/components/ui/Stepper';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { mockProductVerticals, mockProductCategories, mockProductBrands } from '@/data/mockData';
import { cn } from '@/lib/utils';
import {
    ArrowLeft,
    ArrowRight,
    Package,
    Upload,
    Image as ImageIcon,
    Check,
} from 'lucide-react';

const steps: Step[] = [
    { id: 'vertical', label: 'Select Vertical' },
    { id: 'brand', label: 'Select Brand' },
    { id: 'details', label: 'Add Product Details' },
];

export default function AddProductPage() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedVertical, setSelectedVertical] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [productDetails, setProductDetails] = useState({
        name: '',
        sku: '',
        description: '',
        price: '',
        mrp: '',
        stock: '',
    });

    const filteredCategories = mockProductCategories.filter(
        cat => cat.verticalId === selectedVertical
    );

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCategorySelect = (categoryId: string) => {
        setSelectedCategory(categoryId);
        handleNext();
    };

    const handleBrandSelect = (brandId: string) => {
        setSelectedBrand(brandId);
        handleNext();
    };

    const canProceed = () => {
        switch (currentStep) {
            case 0:
                return selectedCategory !== null;
            case 1:
                return selectedBrand !== null;
            case 2:
                return productDetails.name && productDetails.sku && productDetails.price;
            default:
                return false;
        }
    };

    return (
        <div className="space-y-8">
            {/* Stepper */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <Stepper
                    steps={steps}
                    currentStep={currentStep}
                    onStepClick={(step) => step < currentStep && setCurrentStep(step)}
                />
            </div>

            {/* Step Content */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {/* Step 1: Select Vertical */}
                {currentStep === 0 && (
                    <div className="flex min-h-[500px]">
                        {/* Left Sidebar - Verticals */}
                        <div className="w-64 border-r border-slate-200 bg-slate-50">
                            <div className="p-4 border-b border-slate-200">
                                <h3 className="font-semibold text-slate-900">Product Vertical</h3>
                                <p className="text-xs text-slate-500 mt-1">Select a category type</p>
                            </div>
                            <div className="p-2">
                                {mockProductVerticals.map((vertical) => (
                                    <button
                                        key={vertical.id}
                                        onClick={() => setSelectedVertical(vertical.id)}
                                        className={cn(
                                            "w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all",
                                            selectedVertical === vertical.id
                                                ? "bg-blue-600 text-white shadow-md"
                                                : "text-slate-700 hover:bg-white hover:shadow-sm"
                                        )}
                                    >
                                        <span className="text-lg">{vertical.icon}</span>
                                        {vertical.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Right Area - Category Cards */}
                        <div className="flex-1 p-6">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-slate-900">
                                    Select Product Category
                                </h3>
                                <p className="text-sm text-slate-500 mt-1">
                                    {selectedVertical
                                        ? `Choose a category from ${mockProductVerticals.find(v => v.id === selectedVertical)?.name}`
                                        : 'First, select a vertical from the left sidebar'}
                                </p>
                            </div>

                            {!selectedVertical ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Package className="h-16 w-16 text-slate-300 mb-4" />
                                    <p className="text-slate-500">
                                        Select a product vertical to see categories
                                    </p>
                                </div>
                            ) : filteredCategories.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <Package className="h-16 w-16 text-slate-300 mb-4" />
                                    <p className="text-slate-500">
                                        No categories available for this vertical
                                    </p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {filteredCategories.map((category) => (
                                        <button
                                            key={category.id}
                                            onClick={() => handleCategorySelect(category.id)}
                                            className={cn(
                                                "group relative flex flex-col items-center rounded-xl border-2 p-4 text-center transition-all hover:shadow-lg",
                                                selectedCategory === category.id
                                                    ? "border-blue-600 bg-blue-50 shadow-md"
                                                    : "border-slate-200 bg-white hover:border-blue-300"
                                            )}
                                        >
                                            <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-slate-100 mb-3 group-hover:bg-slate-200 transition-colors">
                                                <Package className="h-8 w-8 text-slate-400" />
                                            </div>
                                            <span className="text-sm font-medium text-slate-900">
                                                {category.name}
                                            </span>
                                            {selectedCategory === category.id && (
                                                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                                                    <Check className="h-4 w-4" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Select Brand */}
                {currentStep === 1 && (
                    <div className="p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Select Product Brand
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Choose the brand for your product or select &quot;Other&quot; for unbranded items
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {mockProductBrands.map((brand) => (
                                <button
                                    key={brand.id}
                                    onClick={() => handleBrandSelect(brand.id)}
                                    className={cn(
                                        "group relative flex flex-col items-center rounded-xl border-2 p-6 text-center transition-all hover:shadow-lg",
                                        selectedBrand === brand.id
                                            ? "border-blue-600 bg-blue-50 shadow-md"
                                            : "border-slate-200 bg-white hover:border-blue-300"
                                    )}
                                >
                                    <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-slate-100 mb-3">
                                        <span className="text-2xl font-bold text-slate-400">
                                            {brand.name.charAt(0)}
                                        </span>
                                    </div>
                                    <span className="text-sm font-medium text-slate-900">
                                        {brand.name}
                                    </span>
                                    {selectedBrand === brand.id && (
                                        <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step 3: Product Details */}
                {currentStep === 2 && (
                    <div className="p-6">
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-slate-900">
                                Add Product Details
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                                Fill in the product information below
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left - Product Images */}
                            <div className="lg:col-span-1">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Product Images
                                </label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                    <Upload className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                                    <p className="text-sm text-slate-600 font-medium">
                                        Drop images here or click to upload
                                    </p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        PNG, JPG up to 5MB each
                                    </p>
                                </div>
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div
                                            key={i}
                                            className="aspect-square rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center"
                                        >
                                            <ImageIcon className="h-6 w-6 text-slate-300" />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Right - Form Fields */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Product Name *
                                        </label>
                                        <Input
                                            placeholder="Enter product name"
                                            value={productDetails.name}
                                            onChange={(e) => setProductDetails({
                                                ...productDetails,
                                                name: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            SKU *
                                        </label>
                                        <Input
                                            placeholder="e.g., GEN-BAG-001"
                                            value={productDetails.sku}
                                            onChange={(e) => setProductDetails({
                                                ...productDetails,
                                                sku: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        rows={4}
                                        placeholder="Enter product description..."
                                        className="input resize-none"
                                        value={productDetails.description}
                                        onChange={(e) => setProductDetails({
                                            ...productDetails,
                                            description: e.target.value
                                        })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Selling Price (₹) *
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={productDetails.price}
                                            onChange={(e) => setProductDetails({
                                                ...productDetails,
                                                price: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            MRP (₹)
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={productDetails.mrp}
                                            onChange={(e) => setProductDetails({
                                                ...productDetails,
                                                mrp: e.target.value
                                            })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">
                                            Stock Quantity
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            value={productDetails.stock}
                                            onChange={(e) => setProductDetails({
                                                ...productDetails,
                                                stock: e.target.value
                                            })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-6 py-4">
                    <Button
                        variant="outline"
                        onClick={currentStep === 0 ? () => router.back() : handleBack}
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {currentStep === 0 ? 'Cancel' : 'Back'}
                    </Button>

                    {currentStep < steps.length - 1 ? (
                        <Button onClick={handleNext} disabled={!canProceed()}>
                            Next
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    ) : (
                        <Button disabled={!canProceed()}>
                            <Check className="h-4 w-4" />
                            Add Product
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}
