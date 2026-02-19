import React, { useState, useEffect, useCallback, useRef } from "react";
import { useWarehouse } from "@/context/WarehouseContext";
import { useToast } from "@/context/ToastContext";
import useAuthStore from "@/store/authStore";
import { productService } from "@/services/productService";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import RichTextEditor from "@/components/ui/RichTextEditor";
import ImageUpload from "@/components/ui/ImageUpload";
import MetadataField from "@/components/dashboard/inventory/MetadataField";
import {
  Plus,
  Trash2,
  X,
  Search,
  Loader2,
  Package,
  Tag,
  Layers,
  ChevronDown,
  Upload,
  ImageIcon,
  Type,
  Check,
  GripVertical,
  GraduationCap,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ────────────────────────────────────────────────────────────────
// Cartesian Product Utility
// ────────────────────────────────────────────────────────────────
function cartesian(arrays) {
  if (arrays.length === 0) return [[]];
  const [first, ...rest] = arrays;
  const restCombos = cartesian(rest);
  const combos = [];
  for (const val of first) {
    for (const r of restCombos) {
      combos.push([val, ...r]);
    }
  }
  return combos;
}

// ────────────────────────────────────────────────────────────────
// Brand Search Combobox (inline) — with logo display + Add New
// ────────────────────────────────────────────────────────────────
function BrandCombobox({ selected, onSelect, onAddNew, refreshKey }) {
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, [refreshKey]);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await productService.getBrands({ limit: 100 });
      setBrands(Array.isArray(data) ? data : data?.brands || []);
    } catch (e) {
      console.error("Failed to fetch brands:", e);
    } finally {
      setLoading(false);
    }
  };

  const filtered = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm transition-all",
          open
            ? "border-blue-500 ring-2 ring-blue-500/20"
            : "border-slate-300 hover:border-slate-400",
          !selected && "text-slate-400",
        )}
      >
        <span
          className={cn(
            "flex items-center gap-2",
            selected ? "text-slate-900" : "",
          )}
        >
          {selected?.logoUrl && (
            <img
              src={selected.logoUrl}
              alt=""
              className="h-5 w-5 rounded object-contain"
            />
          )}
          {selected ? selected.name : "Select a brand..."}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          <div className="p-2 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search brands..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm rounded-md border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-48 overflow-y-auto p-1">
            {loading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No brands found
              </p>
            ) : (
              filtered.map((brand) => (
                <button
                  key={brand.id}
                  type="button"
                  onClick={() => {
                    onSelect(brand);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2",
                    selected?.id === brand.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  {brand.logoUrl ? (
                    <img
                      src={brand.logoUrl}
                      alt=""
                      className="h-5 w-5 rounded object-contain flex-shrink-0"
                    />
                  ) : (
                    <div className="h-5 w-5 rounded bg-slate-100 flex-shrink-0" />
                  )}
                  {brand.name}
                </button>
              ))
            )}
          </div>
          {onAddNew && (
            <div className="border-t border-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onAddNew();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-sm text-blue-600 hover:bg-blue-50 flex items-center gap-2 font-medium"
              >
                <Plus className="h-4 w-4" />
                Add New Brand
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Main Component
// ────────────────────────────────────────────────────────────────
const GRADE_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
];

export default function ProductDetailsForm({
  category,
  onBack,
  onSuccess,
  // School-specific props (optional)
  schoolId = null,
  schoolName = null,
  schoolProductType = null,
  prefilledCity = "",
}) {
  const isSchoolFlow = !!schoolId;
  const { activeWarehouse } = useWarehouse();
  const { toast } = useToast();
  const user = useAuthStore((s) => s.user);

  const [submitting, setSubmitting] = useState(false);

  // ── School-specific State ─────────────────────────────────────
  const [grade, setGrade] = useState("");
  const [isMandatory, setIsMandatory] = useState(false);

  // Derive city to use: prefilled (school) > warehouse address (general) > empty
  const cityToUse =
    prefilledCity ||
    activeWarehouse?.city ||
    activeWarehouse?.address?.city ||
    activeWarehouse?.address ||
    "";

  // ── Basic Info ────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    title: "",
    sku: "",
    city: cityToUse || "",
    basePrice: "",
    compareAtPrice: "",
    shortDescription: "",
    description: "", // RTE HTML — maps to productData.description
  });

  // Auto-fill city on mount if available
  useEffect(() => {
    if (cityToUse && !formData.city) {
      setFormData((prev) => ({ ...prev, city: cityToUse }));
    }
  }, [cityToUse]);

  const updateField = (field, value) =>
    setFormData((prev) => ({ ...prev, [field]: value }));

  // ── SKU Auto-Generation ─────────────────────────────────────
  const generateSkuFromTitle = (title) => {
    if (!title.trim()) return "";
    const words = title
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 0)
      .slice(0, 3);
    return words
      .map((w) =>
        w
          .replace(/[^a-zA-Z0-9]/g, "")
          .toUpperCase()
          .slice(0, 4),
      )
      .join("-");
  };

  const handleTitleChange = (title) => {
    const updates = { title };
    // Auto-generate SKU if user hasn't manually edited it
    if (!skuManuallyEdited) {
      updates.sku = generateSkuFromTitle(title);
    }
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);

  // ── Brand ────────────────────────────────────────────────────
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [brandRefreshKey, setBrandRefreshKey] = useState(0);

  // Brand creation modal
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [brandForm, setBrandForm] = useState({
    name: "",
    slug: "",
    description: "",
    country: "",
    logoUrl: "",
  });
  const [isAddingBrand, setIsAddingBrand] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const generateSlug = (name) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleAddBrand = async () => {
    if (!brandForm.name) return;
    setIsAddingBrand(true);
    try {
      const payload = {
        name: brandForm.name,
        slug: brandForm.slug || generateSlug(brandForm.name),
        description: brandForm.description,
        country: brandForm.country,
        logoUrl: brandForm.logoUrl,
      };
      const response = await productService.createBrand(payload);
      const newBrand = response?.data || response;
      if (newBrand?.id) {
        setSelectedBrand(newBrand);
      }
      setShowAddBrand(false);
      setBrandForm({
        name: "",
        slug: "",
        description: "",
        country: "",
        logoUrl: "",
      });
      setBrandRefreshKey((k) => k + 1);
      toast({ title: "Brand created successfully", variant: "success" });
    } catch (error) {
      console.error("Failed to add brand:", error);
      toast({
        title: "Failed to create brand",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setIsAddingBrand(false);
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const result = await productService.uploadImage(file);
      const url = result.data?.url || result.url;
      setBrandForm((prev) => ({ ...prev, logoUrl: url }));
    } catch (error) {
      console.error("Failed to upload logo:", error);
      toast({ title: "Failed to upload logo", variant: "destructive" });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // ── Highlights ───────────────────────────────────────────────
  // Admin stores highlights as productData.highlight: { "key": "value" }
  const [highlights, setHighlights] = useState([]);

  const addHighlight = () => {
    if (highlights.length >= 10) return;
    setHighlights([...highlights, { key: "", value: "" }]);
  };

  const updateHighlight = (idx, field, val) => {
    const h = [...highlights];
    h[idx][field] = val;
    setHighlights(h);
  };

  const removeHighlight = (idx) =>
    setHighlights(highlights.filter((_, i) => i !== idx));

  // ── Images ───────────────────────────────────────────────────
  const [images, setImages] = useState([]);

  // ── Category Attributes (Metadata) ──────────────────────────
  const [categoryAttributes, setCategoryAttributes] = useState([]);
  const [metadata, setMetadata] = useState({});

  useEffect(() => {
    if (category?.id) {
      fetchCategoryAttributes(category.id);
    }
  }, [category?.id]);

  const fetchCategoryAttributes = async (catId) => {
    try {
      const resp = await productService.getCategoryById(catId);
      const data = resp?.category || resp;
      const attrs = data?.productAttributes || [];
      setCategoryAttributes(attrs);
      // Initialize metadata keys
      const initial = {};
      attrs.forEach((attr) => {
        initial[attr.name || attr.key] = "";
      });
      setMetadata(initial);
    } catch (e) {
      console.error("Failed to fetch category attributes:", e);
    }
  };

  const updateMetadata = (key, value) =>
    setMetadata((prev) => ({ ...prev, [key]: value }));

  // ── Options & Variants ───────────────────────────────────────
  // Each option: { id, name, values: [{value, imageUrl}], hasImages }
  const [productOptions, setProductOptions] = useState([]);
  // Per-option inputs for image options: { [optionId]: { name: "", uploading: false } }
  const [imageOptionInputs, setImageOptionInputs] = useState({});

  const addOption = (withImages = false) => {
    if (productOptions.length >= 3) return;
    const id = Date.now().toString();
    setProductOptions([
      ...productOptions,
      { id, name: "", values: [], hasImages: withImages },
    ]);
    if (withImages) {
      setImageOptionInputs((prev) => ({
        ...prev,
        [id]: { name: "", uploading: false },
      }));
    }
  };

  const updateOptionName = (idx, name) => {
    const opts = [...productOptions];
    opts[idx].name = name;
    setProductOptions(opts);
  };

  const addOptionValue = (idx, val) => {
    if (!val.trim()) return;
    const opts = [...productOptions];
    if (!opts[idx].values.find((v) => v.value === val.trim())) {
      opts[idx].values = [
        ...opts[idx].values,
        { value: val.trim(), imageUrl: null },
      ];
      setProductOptions(opts);
    }
  };

  const removeOptionValue = (optIdx, valIdx) => {
    const opts = [...productOptions];
    opts[optIdx].values = opts[optIdx].values.filter((_, i) => i !== valIdx);
    setProductOptions(opts);
  };

  // Drag-to-reorder option values
  const [dragValState, setDragValState] = useState({
    optIdx: null,
    fromIdx: null,
    overIdx: null,
  });

  const reorderOptionValues = (optIdx, fromIdx, toIdx) => {
    if (fromIdx === toIdx) return;
    const opts = [...productOptions];
    const vals = [...opts[optIdx].values];
    const [moved] = vals.splice(fromIdx, 1);
    vals.splice(toIdx, 0, moved);
    opts[optIdx].values = vals;
    setProductOptions(opts);
  };

  // Refs for text-option inputs (for check icon button)
  const optionInputRefs = useRef({});

  // Upload-and-add for image options: uploads the file, then adds the value with the URL
  const addImageOptionValue = async (optIdx, file) => {
    const opt = productOptions[optIdx];
    const inputState = imageOptionInputs[opt.id];
    const valueName = inputState?.name?.trim();
    if (!valueName || !file) return;

    // Set uploading state
    setImageOptionInputs((prev) => ({
      ...prev,
      [opt.id]: { ...prev[opt.id], uploading: true },
    }));

    try {
      const result = await productService.uploadImage(file);
      const url = result.data?.url || result.url;
      const opts = [...productOptions];
      if (!opts[optIdx].values.find((v) => v.value === valueName)) {
        opts[optIdx].values = [
          ...opts[optIdx].values,
          { value: valueName, imageUrl: url || null },
        ];
        setProductOptions(opts);
      }
      // Clear input
      setImageOptionInputs((prev) => ({
        ...prev,
        [opt.id]: { name: "", uploading: false },
      }));
    } catch (e) {
      console.error("Option image upload failed:", e);
      setImageOptionInputs((prev) => ({
        ...prev,
        [opt.id]: { ...prev[opt.id], uploading: false },
      }));
    }
  };

  const removeOption = (idx) => {
    const opt = productOptions[idx];
    setProductOptions(productOptions.filter((_, i) => i !== idx));
    if (opt.hasImages) {
      setImageOptionInputs((prev) => {
        const copy = { ...prev };
        delete copy[opt.id];
        return copy;
      });
    }
  };

  // ── Variant Generator ────────────────────────────────────────
  const [variants, setVariants] = useState([]);

  useEffect(() => {
    const validOpts = productOptions.filter(
      (o) => o.name.trim() && o.values.length > 0,
    );

    if (validOpts.length === 0) {
      // Default variant — single variant with base info
      setVariants([
        {
          name: "Default Variant",
          option1: null,
          option2: null,
          option3: null,
          sku: formData.sku || "",
          compareAtPrice: parseFloat(formData.compareAtPrice) || 0,
          price: parseFloat(formData.basePrice) || 0,
          discount: 0,
          stock: 0,
          weight: 0,
        },
      ]);
      return;
    }

    const valueArrays = validOpts.map((o) => o.values.map((v) => v.value));
    const combos = cartesian(valueArrays);

    setVariants((prev) => {
      const lookup = {};
      prev.forEach((v) => {
        lookup[v.name] = v;
      });

      return combos.map((combo) => {
        const name = combo.join(" / ");
        const skuSuffix = combo
          .map((v) => v.replace(/\s+/g, "").toUpperCase())
          .join("-");
        const existing = lookup[name];

        const compareAt =
          existing?.compareAtPrice ??
          (parseFloat(formData.compareAtPrice) || 0);
        const price = existing?.price ?? (parseFloat(formData.basePrice) || 0);

        return {
          name,
          option1: combo[0] || null,
          option2: combo[1] || null,
          option3: combo[2] || null,
          sku: existing?.sku || `${formData.sku}-${skuSuffix}`,
          compareAtPrice: compareAt,
          price,
          discount:
            compareAt > 0
              ? Math.round(((compareAt - price) / compareAt) * 100)
              : 0,
          stock: existing?.stock ?? 0,
          weight: existing?.weight ?? 0,
        };
      });
    });
  }, [
    productOptions,
    formData.sku,
    formData.basePrice,
    formData.compareAtPrice,
  ]);

  // ── Bidirectional Discount ───────────────────────────────────
  const updateVariantPrice = (idx, newPrice) => {
    setVariants((prev) => {
      const v = [...prev];
      const price = parseFloat(newPrice);
      const validPrice = isNaN(price) ? 0 : price;

      const compareAt = v[idx].compareAtPrice || 0;

      v[idx] = {
        ...v[idx],
        price: validPrice, // allow typing incomplete numbers
        discount:
          compareAt > 0
            ? Math.round(((compareAt - validPrice) / compareAt) * 100)
            : 0,
      };
      return v;
    });
  };

  const updateVariantDiscount = (idx, newDiscount) => {
    setVariants((prev) => {
      const v = [...prev];
      const discount = parseFloat(newDiscount);
      const validDiscount = isNaN(discount) ? 0 : discount;

      const compareAt = v[idx].compareAtPrice || 0;
      // Formula: Price = CompareAt * (1 - Discount/100)
      const price =
        compareAt > 0 ? compareAt * (1 - validDiscount / 100) : v[idx].price;

      v[idx] = {
        ...v[idx],
        discount: validDiscount, // allow typing incomplete numbers
        price: Math.round(price * 100) / 100,
      };
      return v;
    });
  };

  const updateVariantCompareAt = (idx, val) => {
    setVariants((prev) => {
      const v = [...prev];
      const compareAt = parseFloat(val);
      const validCompareAt = isNaN(compareAt) ? 0 : compareAt;
      const price = v[idx].price || 0;

      v[idx] = {
        ...v[idx],
        compareAtPrice: validCompareAt,
        discount:
          validCompareAt > 0
            ? Math.round(((validCompareAt - price) / validCompareAt) * 100)
            : 0,
      };
      return v;
    });
  };

  const updateVariantField = (idx, field, value) => {
    setVariants((prev) => {
      const v = [...prev];
      v[idx] = { ...v[idx], [field]: value };
      return v;
    });
  };

  // ── Payload & Submission ─────────────────────────────────────
  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast({ title: "Product title is required", variant: "destructive" });
      return;
    }
    if (!formData.basePrice) {
      toast({ title: "Base price is required", variant: "destructive" });
      return;
    }
    if (!formData.shortDescription.trim()) {
      toast({ title: "Short description is required", variant: "destructive" });
      return;
    }
    if (!formData.description.trim() || formData.description === "<p></p>") {
      toast({ title: "Full description is required", variant: "destructive" });
      return;
    }
    if (images.length === 0) {
      toast({
        title: "At least one image is required",
        variant: "destructive",
      });
      return;
    }
    if (!category) {
      toast({ title: "Category is required", variant: "destructive" });
      return;
    }
    if (!activeWarehouse) {
      toast({
        title: "No warehouse selected",
        description: "Please select a warehouse from the header.",
        variant: "destructive",
      });
      return;
    }

    // Build highlights object: { "Material": "Cotton", "Size": "Regular" }
    const highlightObj = {};
    highlights.forEach((h) => {
      if (h.key.trim() && h.value.trim()) {
        highlightObj[h.key.trim()] = h.value.trim();
      }
    });

    // Find highest discount variant for compare_price in metadata
    let comparePriceMeta = parseFloat(formData.compareAtPrice) || null;
    if (variants.length > 0) {
      const maxDiscountVariant = [...variants].sort(
        (a, b) => (b.discount || 0) - (a.discount || 0),
      )[0];
      if (maxDiscountVariant?.compareAtPrice) {
        comparePriceMeta = maxDiscountVariant.compareAtPrice;
      }
    }

    // Build category attributes metadata
    const categoryAttrsObj = {};
    categoryAttributes.forEach((attr) => {
      const key = attr.name || attr.key;
      if (metadata[key]) {
        categoryAttrsObj[key] = metadata[key];
      }
    });

    // School validation
    if (isSchoolFlow && !grade) {
      toast({
        title: "Grade is required for school products",
        variant: "destructive",
      });
      return;
    }

    const payload = {
      replaceVariants: false,
      replaceImages: false,
      retailerId: user?.id,

      productData: {
        title: formData.title,
        sku: formData.sku,
        productType: isSchoolFlow ? schoolProductType : "general",
        basePrice: parseFloat(formData.basePrice),
        compareAtPrice: parseFloat(formData.compareAtPrice) || null,
        shortDescription: formData.shortDescription,
        description: formData.description, // RTE HTML
        city: formData.city,
        currency: "INR",
        highlight: highlightObj,
        metadata: {
          categoryAttributes: categoryAttrsObj,
          compare_price: comparePriceMeta,
        },
        isActive: false,
      },

      productOptions: productOptions
        .filter((o) => o.name.trim() && o.values.length > 0)
        .map((o, i) => ({
          name: o.name,
          values: o.values.map((v) => ({
            value: v.value,
            imageUrl: v.imageUrl,
          })),
          position: i + 1,
          isRequired: true,
        })),

      variants: variants.map((v) => ({
        sku: v.sku,
        price: v.price,
        compareAtPrice: v.compareAtPrice || null,
        stock: parseInt(v.stock) || 0,
        weight: parseFloat(v.weight) || 0,
        option1: v.option1,
        option2: v.option2,
        option3: v.option3,
        metadata: {},
      })),

      images: images.map((url, i) => ({
        url,
        altText: formData.title,
        sortOrder: i,
        isPrimary: i === 0,
      })),

      warehouseData: {
        type: "existing",
        warehouseId: activeWarehouse.id,
      },
      brandData: selectedBrand
        ? { type: "existing", brandId: selectedBrand.id }
        : null,
      categories: [{ id: category.id }],
      schoolData: isSchoolFlow
        ? {
            schoolId: schoolId,
            grade: grade,
            mandatory: isMandatory,
          }
        : null,
    };

    setSubmitting(true);
    try {
      await productService.createProduct(payload);
      toast({
        title: "Product created successfully",
        variant: "success",
      });
      onSuccess();
    } catch (error) {
      console.error("Product creation failed:", error);
      toast({
        title: "Failed to create product",
        description: error.response?.data?.message || error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-8">
      {/* ════════════ LEFT COLUMN ════════════ */}
      <div className="lg:col-span-2 space-y-6">
        {/* ── Basic Info ── */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Product Title"
              required
              value={formData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="e.g. Classmate Notebook A4 200 Pages"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="SKU"
                value={formData.sku}
                onChange={(e) => {
                  setSkuManuallyEdited(true);
                  updateField("sku", e.target.value);
                }}
                placeholder="Auto-generated from title"
                helperText={
                  skuManuallyEdited
                    ? "Manually set"
                    : "Auto-generated from title"
                }
              />
              <Input
                label="City"
                value={formData.city}
                onChange={(e) => updateField("city", e.target.value)}
                placeholder="e.g. Delhi"
                disabled={!!cityToUse}
                helperText={cityToUse ? "Auto-filled from warehouse" : ""}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Base Price (₹)"
                required
                type="number"
                min="0"
                step="0.01"
                value={formData.basePrice}
                onChange={(e) => updateField("basePrice", e.target.value)}
                placeholder="0.00"
              />
              <Input
                label="Compare At Price (₹)"
                type="number"
                min="0"
                step="0.01"
                value={formData.compareAtPrice}
                onChange={(e) => updateField("compareAtPrice", e.target.value)}
                placeholder="0.00"
                helperText="MRP / original price for discount"
              />
            </div>

            {/* Brand Selector */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Brand
              </label>
              <BrandCombobox
                selected={selectedBrand}
                onSelect={setSelectedBrand}
                onAddNew={() => setShowAddBrand(true)}
                refreshKey={brandRefreshKey}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Short Description <span className="text-red-500">*</span>
              </label>
              <textarea
                className="flex w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 transition-all hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 min-h-[80px]"
                value={formData.shortDescription}
                onChange={(e) =>
                  updateField("shortDescription", e.target.value)
                }
                placeholder="Brief product description (shown on cards)..."
                rows={3}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Full Description <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={formData.description}
                onChange={(html) => updateField("description", html)}
                placeholder="Write a detailed product description..."
              />
            </div>
          </CardContent>
        </Card>

        {/* ── Product Highlights ── */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Product Highlights</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addHighlight}
              disabled={highlights.length >= 10}
            >
              <Plus className="h-4 w-4" /> Add
            </Button>
          </CardHeader>
          <CardContent>
            {highlights.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">
                No highlights added. Click "Add" to create one.
              </p>
            ) : (
              <div className="space-y-3">
                {highlights.map((h, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-[160px]">
                      <Input
                        floatingLabel
                        label="Key"
                        value={h.key}
                        onChange={(e) =>
                          updateHighlight(
                            idx,
                            "key",
                            e.target.value.slice(0, 15),
                          )
                        }
                      />
                    </div>
                    <div className="flex-1">
                      <Input
                        floatingLabel
                        label="Value"
                        value={h.value}
                        onChange={(e) =>
                          updateHighlight(
                            idx,
                            "value",
                            e.target.value.slice(0, 40),
                          )
                        }
                      />
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHighlight(idx)}
                      className="text-red-500 hover:text-red-700 shrink-0 mt-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <p className="text-xs text-slate-400">
                  {highlights.length}/10 highlights
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Category Attributes (Metadata) ── */}
        {categoryAttributes.length > 0 && (
          <Card>
            <CardHeader className="flex-row items-center gap-3">
              <div className="p-2 bg-blue-50 text-blue-500 rounded-lg">
                <Layers size={20} />
              </div>
              <div>
                <CardTitle>Category Attributes</CardTitle>
                <p className="text-sm text-slate-500 mt-0.5">
                  Fill in the attributes required for this category
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryAttributes.map((attr) => {
                  const isGroup = attr.type === "group";
                  return (
                    <div
                      key={attr.id || attr.key || attr.name}
                      className={isGroup ? "md:col-span-2" : ""}
                    >
                      <MetadataField
                        attribute={attr}
                        value={metadata}
                        onChange={setMetadata}
                      />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Media card moved to right sidebar */}

        {/* ── Options & Variants ── */}
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Options & Variants</CardTitle>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(false)}
                disabled={productOptions.length >= 3}
              >
                <Type className="h-4 w-4" /> Add Option
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addOption(true)}
                disabled={productOptions.length >= 3}
              >
                <ImageIcon className="h-4 w-4" /> Add Option with Image
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Options Configuration */}
            {productOptions.map((opt, optIdx) => (
              <div
                key={opt.id}
                className={cn(
                  "p-4 rounded-lg border relative",
                  opt.hasImages
                    ? "bg-blue-50/50 border-blue-200"
                    : "bg-slate-50 border-slate-200",
                )}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-[200px]">
                    <Input
                      floatingLabel
                      label={`Option ${optIdx + 1} name`}
                      value={opt.name}
                      onChange={(e) => updateOptionName(optIdx, e.target.value)}
                    />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {opt.hasImages && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        With Images
                      </span>
                    )}
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(optIdx)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8 p-0"
                  title="Remove Option"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* Values chips — draggable */}
                <div className="flex flex-wrap gap-2 items-center mb-3">
                  {opt.values.map((valObj, valIdx) => (
                    <div
                      key={`${valObj.value}-${valIdx}`}
                      draggable
                      onDragStart={() =>
                        setDragValState({
                          optIdx,
                          fromIdx: valIdx,
                          overIdx: null,
                        })
                      }
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragValState((prev) => ({
                          ...prev,
                          overIdx: valIdx,
                        }));
                      }}
                      onDragLeave={() =>
                        setDragValState((prev) => ({ ...prev, overIdx: null }))
                      }
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragValState.fromIdx !== null) {
                          reorderOptionValues(
                            optIdx,
                            dragValState.fromIdx,
                            valIdx,
                          );
                        }
                        setDragValState({
                          optIdx: null,
                          fromIdx: null,
                          overIdx: null,
                        });
                      }}
                      onDragEnd={() =>
                        setDragValState({
                          optIdx: null,
                          fromIdx: null,
                          overIdx: null,
                        })
                      }
                      className={cn(
                        "inline-flex items-center gap-1.5 bg-white border rounded-full px-3 py-1 text-sm shadow-sm cursor-grab active:cursor-grabbing transition-all duration-150",
                        dragValState.optIdx === optIdx &&
                          dragValState.fromIdx === valIdx &&
                          "opacity-50 scale-95",
                        dragValState.optIdx === optIdx &&
                          dragValState.overIdx === valIdx &&
                          dragValState.fromIdx !== valIdx &&
                          "ring-2 ring-blue-500 scale-105",
                        dragValState.optIdx !== optIdx ||
                          dragValState.fromIdx === null
                          ? "border-slate-200"
                          : "",
                      )}
                    >
                      <GripVertical className="h-3 w-3 text-slate-300" />
                      {opt.hasImages && valObj.imageUrl && (
                        <img
                          src={valObj.imageUrl}
                          alt={valObj.value}
                          className="h-5 w-5 rounded-full object-cover ring-1 ring-slate-200 pointer-events-none"
                        />
                      )}
                      <span className="pointer-events-none">
                        {valObj.value}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeOptionValue(optIdx, valIdx)}
                      >
                        <X className="h-3 w-3 text-slate-400 hover:text-red-500 transition-colors" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Add value input — different UI for image vs text options */}
                {opt.hasImages ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      className="h-9 flex-1 max-w-[180px] text-sm rounded-md border border-blue-200 bg-white px-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      placeholder="Value name (e.g. Red)"
                      value={imageOptionInputs[opt.id]?.name || ""}
                      onChange={(e) =>
                        setImageOptionInputs((prev) => ({
                          ...prev,
                          [opt.id]: { ...prev[opt.id], name: e.target.value },
                        }))
                      }
                    />
                    <label
                      className={cn(
                        "inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-medium cursor-pointer transition-colors",
                        imageOptionInputs[opt.id]?.uploading
                          ? "bg-blue-100 text-blue-400 cursor-wait"
                          : imageOptionInputs[opt.id]?.name?.trim()
                            ? "bg-blue-500 text-white hover:bg-blue-600"
                            : "bg-slate-200 text-slate-400 cursor-not-allowed",
                      )}
                    >
                      {imageOptionInputs[opt.id]?.uploading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                      {imageOptionInputs[opt.id]?.uploading
                        ? "Uploading..."
                        : "Upload & Add"}
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        disabled={
                          !imageOptionInputs[opt.id]?.name?.trim() ||
                          imageOptionInputs[opt.id]?.uploading
                        }
                        onChange={(e) => {
                          if (e.target.files[0]) {
                            addImageOptionValue(optIdx, e.target.files[0]);
                          }
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      ref={(el) => {
                        optionInputRefs.current[optIdx] = el;
                      }}
                      type="text"
                      className="h-8 w-36 text-sm rounded-md border border-slate-200 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      placeholder="Add value"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addOptionValue(optIdx, e.currentTarget.value);
                          e.currentTarget.value = "";
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = optionInputRefs.current[optIdx];
                        if (input && input.value.trim()) {
                          addOptionValue(optIdx, input.value);
                          input.value = "";
                          input.focus();
                        }
                      }}
                      className="h-8 w-8 flex items-center justify-center rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                      title="Add value"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {productOptions.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-4">
                No options defined. A single default variant will be created
                automatically.
              </p>
            )}

            {/* Variants Table */}
            {variants.length > 0 && (
              <div className="border border-slate-200 rounded-lg overflow-hidden mt-4">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left font-medium">
                          Variant
                        </th>
                        <th className="px-4 py-3 text-left font-medium w-32">
                          SKU
                        </th>
                        <th className="px-4 py-3 text-left font-medium w-24">
                          Compare At (₹)
                        </th>
                        <th className="px-4 py-3 text-left font-medium w-20">
                          % Disc
                        </th>
                        <th className="px-4 py-3 text-left font-medium w-24">
                          Price (₹)
                        </th>
                        <th className="px-4 py-3 text-left font-medium w-20">
                          Stock
                        </th>
                        <th className="px-4 py-3 text-left font-medium w-20">
                          Weight
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {variants.map((v, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="px-4 py-2.5 font-medium text-slate-900 whitespace-nowrap">
                            {v.name}
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="text"
                              className="h-8 w-full text-sm rounded border border-slate-200 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              value={v.sku}
                              onChange={(e) =>
                                updateVariantField(idx, "sku", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              className="h-8 w-full text-sm rounded border border-slate-200 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              value={v.compareAtPrice}
                              onChange={(e) =>
                                updateVariantCompareAt(idx, e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              className="h-8 w-full text-sm rounded border border-slate-200 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              value={v.discount}
                              min="0"
                              max="100"
                              onChange={(e) =>
                                updateVariantDiscount(idx, e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              className="h-8 w-full text-sm rounded border border-slate-200 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              value={v.price}
                              onChange={(e) =>
                                updateVariantPrice(idx, e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              className="h-8 w-full text-sm rounded border border-slate-200 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              value={v.stock}
                              min="0"
                              onChange={(e) =>
                                updateVariantField(idx, "stock", e.target.value)
                              }
                            />
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              type="number"
                              className="h-8 w-full text-sm rounded border border-slate-200 px-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                              value={v.weight}
                              min="0"
                              step="0.01"
                              onChange={(e) =>
                                updateVariantField(
                                  idx,
                                  "weight",
                                  e.target.value,
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ════════════ RIGHT COLUMN (SIDEBAR) ════════════ */}
      <div className="lg:col-span-1">
        <div className="sticky top-6 space-y-6">
          {/* ── School Info Card (only in school flow) ── */}
          {isSchoolFlow && (
            <Card>
              <CardHeader className="flex-row items-center gap-3">
                <div className="p-2 bg-violet-50 text-violet-600 rounded-lg">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <CardTitle>School Product</CardTitle>
                  <p className="text-sm text-slate-500 mt-0.5">
                    Linked to school
                  </p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* School Name (read-only) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    School
                  </label>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800">
                    <GraduationCap className="h-4 w-4 text-violet-500 shrink-0" />
                    {schoolName}
                  </div>
                </div>

                {/* Product Type (read-only) */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    Product Type
                  </label>
                  <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800 capitalize">
                    {schoolProductType}
                  </div>
                </div>

                {/* City (read-only) */}
                {prefilledCity && (
                  <div>
                    <label className="mb-1 block text-xs font-medium text-slate-500">
                      City
                    </label>
                    <div className="flex items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-800">
                      <MapPin className="h-4 w-4 text-blue-500 shrink-0" />
                      {prefilledCity}
                    </div>
                  </div>
                )}

                {/* Grade Selector */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Grade <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    className="flex h-11 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm transition-all hover:border-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    <option value="">Select Grade</option>
                    {GRADE_OPTIONS.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Mandatory Toggle */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      Mandatory
                    </p>
                    <p className="text-xs text-slate-500">
                      Is this product mandatory for the school?
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMandatory(!isMandatory)}
                    className={cn(
                      "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      isMandatory ? "bg-blue-600" : "bg-slate-200",
                    )}
                  >
                    <span
                      className={cn(
                        "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform",
                        isMandatory ? "translate-x-5" : "translate-x-0",
                      )}
                    />
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
          {/* ── Media (moved here) ── */}
          <Card>
            <CardHeader>
              <CardTitle>
                Media <span className="text-red-500">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload
                images={images}
                onChange={setImages}
                maxImages={10}
              />
            </CardContent>
          </Card>

          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Layers className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Category</p>
                  <p className="font-medium text-slate-900">
                    {category?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Tag className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Brand</p>
                  <p className="font-medium text-slate-900">
                    {selectedBrand?.name || "Not selected"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm">
                <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-500 text-xs">Variants</p>
                  <p className="font-medium text-slate-900">
                    {variants.length || "No variants"}
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-sm">
                  <div className="h-8 w-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Upload className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Images</p>
                    <p className="font-medium text-slate-900">
                      {images.length} uploaded
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Card */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                loading={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                Publish Product
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={onBack}
              >
                Back to Categories
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ═══ Add Brand Modal ═══ */}
      {showAddBrand && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-800">
                Add New Brand
              </h3>
              <button
                type="button"
                onClick={() => setShowAddBrand(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <Input
                label="Brand Name"
                required
                placeholder="e.g. Nike"
                value={brandForm.name}
                onChange={(e) =>
                  setBrandForm({
                    ...brandForm,
                    name: e.target.value,
                    slug: generateSlug(e.target.value),
                  })
                }
              />
              <Input
                label="Slug"
                placeholder="e.g. nike"
                value={brandForm.slug}
                onChange={(e) =>
                  setBrandForm({ ...brandForm, slug: e.target.value })
                }
              />
              <Input
                label="Description"
                placeholder="e.g. Just do it."
                value={brandForm.description}
                onChange={(e) =>
                  setBrandForm({ ...brandForm, description: e.target.value })
                }
              />
              <Input
                label="Country"
                placeholder="e.g. India"
                value={brandForm.country}
                onChange={(e) =>
                  setBrandForm({ ...brandForm, country: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Brand Logo
                </label>
                <div className="flex items-center gap-3">
                  {brandForm.logoUrl ? (
                    <img
                      src={brandForm.logoUrl}
                      alt="Logo preview"
                      className="w-12 h-12 object-contain rounded border border-slate-200"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-slate-100 rounded border border-slate-200 flex items-center justify-center text-slate-400 text-xs">
                      No logo
                    </div>
                  )}
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <span className="px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 rounded text-slate-700 flex items-center gap-2 transition-colors">
                      {isUploadingLogo ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Plus size={14} />
                          {brandForm.logoUrl ? "Change" : "Upload"}
                        </>
                      )}
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowAddBrand(false)}
                className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBrand}
                disabled={isAddingBrand || !brandForm.name}
                className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isAddingBrand && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                Add Brand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
