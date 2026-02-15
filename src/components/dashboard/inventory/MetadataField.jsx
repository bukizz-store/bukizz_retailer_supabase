import React, { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/Input";
import { productService } from "@/services/productService";
import { useToast } from "@/context/ToastContext";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Custom styled select dropdown (replaces native <select>)
 */
const CustomSelect = ({
  value,
  options,
  onChange,
  placeholder,
  label,
  required,
}) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div>
      {label && (
        <label className="mb-1.5 block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      <div ref={ref} className="relative">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className={cn(
            "flex h-11 w-full items-center justify-between rounded-lg border bg-white px-4 py-2.5 text-sm transition-all",
            open
              ? "border-blue-500 ring-2 ring-blue-500/20"
              : "border-slate-300 hover:border-slate-400",
            selected ? "text-slate-900" : "text-slate-400",
          )}
        >
          <span className="truncate">
            {selected ? selected.label : placeholder || "Select..."}
          </span>
          <ChevronDown
            size={16}
            className={cn(
              "text-slate-400 transition-transform duration-200 shrink-0 ml-2",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="absolute z-50 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
            <div className="max-h-56 overflow-y-auto py-1">
              {/* Empty / placeholder option */}
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                  !value
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-400 hover:bg-slate-50",
                )}
              >
                <span className="w-4 shrink-0">
                  {!value && <Check size={14} />}
                </span>
                <span className="italic">{placeholder || "None"}</span>
              </button>

              {options.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2 px-4 py-2.5 text-sm transition-colors",
                    value === opt.value
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span className="w-4 shrink-0">
                    {value === opt.value && (
                      <Check size={14} className="text-blue-600" />
                    )}
                  </span>
                  <span className="truncate">{opt.label}</span>
                </button>
              ))}

              {options.length === 0 && (
                <p className="px-4 py-3 text-sm text-slate-400 text-center">
                  No options available
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * MetadataField - Recursive component that renders a single category attribute field.
 * Supports: text, number, select, image, group (nested).
 */
const MetadataField = ({ attribute, value, onChange, path = "" }) => {
  const {
    key,
    label,
    name,
    type,
    required,
    config = {},
    options,
    fields = [],
  } = attribute;
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const fieldKey = key || name;
  const fieldLabel = label || name || key;
  const fieldPath = path ? `${path}.${fieldKey}` : fieldKey;

  const getNestedValue = (obj, pathStr) => {
    if (!pathStr || !obj) return obj;
    return pathStr.split(".").reduce((acc, part) => acc?.[part], obj);
  };

  const setNestedValue = (obj, pathStr, newValue) => {
    if (!pathStr) return newValue;
    const parts = pathStr.split(".");
    const result = { ...obj };
    let current = result;
    for (let i = 0; i < parts.length - 1; i++) {
      current[parts[i]] = { ...(current[parts[i]] || {}) };
      current = current[parts[i]];
    }
    current[parts[parts.length - 1]] = newValue;
    return result;
  };

  const fieldValue = getNestedValue(value, fieldPath);

  const handleChange = (newFieldValue) => {
    const updated = setNestedValue(value || {}, fieldPath, newFieldValue);
    onChange(updated);
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const result = await productService.uploadImage(file);
      const imageUrl = result.data?.url || result.url;
      const currentImages = Array.isArray(fieldValue) ? fieldValue : [];
      const maxLimit = config.maxLimit || 1;
      if (currentImages.length < maxLimit) {
        handleChange([...currentImages, imageUrl]);
      } else {
        toast({
          title: `Maximum ${maxLimit} image(s) allowed`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      toast({ title: "Failed to upload image", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    const currentImages = Array.isArray(fieldValue) ? fieldValue : [];
    handleChange(currentImages.filter((_, i) => i !== index));
  };

  const resolveOptions = () => {
    const opts = config?.options || options || [];
    return opts.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt,
    );
  };

  switch (type) {
    case "text":
      return (
        <Input
          label={fieldLabel}
          required={required}
          value={fieldValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${fieldLabel.toLowerCase()}`}
        />
      );

    case "number":
      return (
        <Input
          label={fieldLabel}
          type="number"
          required={required}
          value={fieldValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${fieldLabel.toLowerCase()}`}
        />
      );

    case "select": {
      const selectOptions = resolveOptions();
      return (
        <CustomSelect
          label={fieldLabel}
          required={required}
          value={fieldValue || ""}
          options={selectOptions}
          onChange={handleChange}
          placeholder={`Select ${fieldLabel.toLowerCase()}`}
        />
      );
    }

    case "image": {
      const maxLimit = config.maxLimit || 1;
      const currentImages = Array.isArray(fieldValue) ? fieldValue : [];
      return (
        <div className="w-full">
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            {fieldLabel}
            {required && <span className="text-red-500 ml-1">*</span>}
            <span className="text-slate-400 font-normal ml-2">
              ({currentImages.length}/{maxLimit})
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {currentImages.map((url, idx) => (
              <div key={idx} className="relative group">
                <img
                  src={url}
                  alt={`${fieldLabel} ${idx + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
          {currentImages.length < maxLimit && (
            <label className="cursor-pointer inline-block">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileRef}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                  e.target.value = "";
                }}
                disabled={uploading}
              />
              <span
                className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border-2 border-dashed transition-colors",
                  uploading
                    ? "bg-slate-100 border-slate-200 text-slate-400"
                    : "border-slate-300 text-slate-600 hover:border-blue-400 hover:text-blue-500",
                )}
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Plus size={16} />
                    Add Image
                  </>
                )}
              </span>
            </label>
          )}
        </div>
      );
    }

    case "group":
      return (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-200">
            <ChevronRight size={16} className="text-slate-400" />
            <h3 className="text-sm font-semibold text-slate-700">
              {fieldLabel}
            </h3>
          </div>
          <div className="space-y-4">
            {fields.map((childAttr) => (
              <MetadataField
                key={childAttr.id || childAttr.key || childAttr.name}
                attribute={childAttr}
                value={value}
                onChange={onChange}
                path={fieldPath}
              />
            ))}
            {fields.length === 0 && (
              <p className="text-sm text-slate-400 italic">
                No fields in this group.
              </p>
            )}
          </div>
        </div>
      );

    default:
      return (
        <Input
          label={fieldLabel}
          value={fieldValue || ""}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={`Enter ${fieldLabel.toLowerCase()}`}
        />
      );
  }
};

export default MetadataField;
