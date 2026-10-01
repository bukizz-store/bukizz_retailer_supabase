import React, { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Layers,
  Info,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Calculator,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/use-toast";
import kitService from "@/services/kitService";

/**
 * KitComponentModal
 *
 * Provides a dynamic modal for retailers to bifurcate bundle/kit product variants
 * into itemized loose components (e.g. Textbooks, Notebooks, Stationery).
 * Avoids mixed-supply GST penalties and automatically performs bottom-up price rollups.
 */
export default function KitComponentModal({
  isOpen,
  onClose,
  variant,
  variantIndex,
  productId,
  gstSlabs = [],
  onSaveSuccess,
}) {
  const { toast } = useToast();
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  // Initialize or fetch component items when modal opens
  useEffect(() => {
    if (!isOpen || !variant) return;

    setFormErrors({});

    const initializeWithFallback = () => {
      if (variant.components && variant.components.length > 0) {
        setComponents(
          variant.components.map((c, i) => ({
            id: c.id || `item-${Date.now()}-${i}`,
            componentTitle: c.componentTitle || c.component_title || "",
            quantity: c.quantity !== undefined ? c.quantity : 1,
            gstSlabId: c.gstSlabId || c.gst_slab_id || (gstSlabs[0]?.id || ""),
            hsnSacCode: c.hsnSacCode || c.hsn_sac_code || "4901",
            compareAtPrice:
              c.compareAtPrice !== undefined
                ? c.compareAtPrice
                : c.compare_at_price !== undefined
                  ? c.compare_at_price
                  : "",
            unitPrice:
              c.unitPrice !== undefined
                ? c.unitPrice
                : c.unit_price !== undefined
                  ? c.unit_price
                  : "",
          }))
        );
      } else {
        // Initial empty row with sensible defaults
        const defaultSlab = gstSlabs[0] || {};
        setComponents([
          {
            id: `item-${Date.now()}-0`,
            componentTitle: "",
            quantity: 1,
            gstSlabId: defaultSlab.id || "",
            hsnSacCode: "4901",
            compareAtPrice: variant.compareAtPrice ? String(variant.compareAtPrice) : "",
            unitPrice: variant.price ? String(variant.price) : "",
          },
        ]);
      }
    };

    // If variant is persisted and marked as split, fetch latest from backend
    if (variant.id && variant.isSplitGst && (!variant.components || variant.components.length === 0)) {
      setLoading(true);
      kitService
        .getVariantComponents(variant.id)
        .then((res) => {
          const items = res?.data || res || [];
          if (Array.isArray(items) && items.length > 0) {
            setComponents(
              items.map((c, i) => ({
                id: c.id || `item-${i}`,
                componentTitle: c.component_title || c.componentTitle || "",
                quantity: c.quantity || 1,
                gstSlabId: c.gst_slab_id || c.gstSlabId || (gstSlabs[0]?.id || ""),
                hsnSacCode: c.hsn_sac_code || c.hsnSacCode || "",
                compareAtPrice: c.compare_at_price ?? c.compareAtPrice ?? "",
                unitPrice: c.unit_price ?? c.unitPrice ?? "",
              }))
            );
          } else {
            initializeWithFallback();
          }
        })
        .catch((err) => {
          console.warn("Could not fetch remote components, using local state:", err);
          initializeWithFallback();
        })
        .finally(() => setLoading(false));
    } else {
      initializeWithFallback();
    }
  }, [isOpen, variant, gstSlabs]);

  if (!isOpen || !variant) return null;

  // Add a new loose component row
  const handleAddRow = () => {
    const defaultSlab = gstSlabs[0] || {};
    setComponents((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}-${prev.length}`,
        componentTitle: "",
        quantity: 1,
        gstSlabId: defaultSlab.id || "",
        hsnSacCode: defaultSlab.hsn || defaultSlab.hsn_sac_code || "4901",
        compareAtPrice: "",
        unitPrice: "",
      },
    ]);
  };

  // Remove a loose component row
  const handleRemoveRow = (idx) => {
    if (components.length <= 1) {
      toast({
        title: "At least one component required",
        description: "A bifurcated kit must contain at least one loose component item.",
        variant: "destructive",
      });
      return;
    }
    setComponents((prev) => prev.filter((_, i) => i !== idx));
  };

  // Field change handler
  const handleFieldChange = (idx, field, value) => {
    setComponents((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });

    // Clear error for this field
    if (formErrors[`${idx}_${field}`]) {
      setFormErrors((prev) => {
        const copy = { ...prev };
        delete copy[`${idx}_${field}`];
        return copy;
      });
    }
  };

  // GST Slab dropdown change
  const handleSlabChange = (idx, slabId) => {
    setComponents((prev) => {
      const updated = [...prev];
      updated[idx] = {
        ...updated[idx],
        gstSlabId: slabId,
      };
      return updated;
    });
  };

  // ── Bottom-Up Calculation Rollups ───────────────────────────
  const totalSellingPrice = components.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = parseFloat(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);

  const totalCompareAtPrice = components.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const compareAt = parseFloat(item.compareAtPrice) || 0;
    return sum + qty * compareAt;
  }, 0);

  const roundedTotalPrice = Math.round(totalSellingPrice * 100) / 100;
  const roundedTotalCompareAt = Math.round(totalCompareAtPrice * 100) / 100;

  const discountPercent =
    roundedTotalCompareAt > 0
      ? Math.round(
        ((roundedTotalCompareAt - roundedTotalPrice) / roundedTotalCompareAt) *
        100
      )
      : 0;

  // ── Validation & Submission ─────────────────────────────────
  const validateForm = () => {
    const errors = {};
    if (components.length === 0) {
      toast({
        title: "No components added",
        description: "Please add at least one component to the kit.",
        variant: "destructive",
      });
      return false;
    }

    components.forEach((item, idx) => {
      if (!item.componentTitle || !item.componentTitle.trim()) {
        errors[`${idx}_title`] = "Title is required";
      }
      const qty = parseInt(item.quantity, 10);
      if (isNaN(qty) || qty < 1) {
        errors[`${idx}_quantity`] = "Min 1";
      }
      if (!item.gstSlabId) {
        errors[`${idx}_slab`] = "Select a slab";
      }
      const unitPrice = parseFloat(item.unitPrice);
      if (isNaN(unitPrice) || unitPrice < 0) {
        errors[`${idx}_unitPrice`] = "Valid price required";
      }
      const rawCompare = parseFloat(item.compareAtPrice);
      const compareAt = !isNaN(rawCompare) && rawCompare > 0 ? rawCompare : unitPrice;
      if (!isNaN(unitPrice) && compareAt < unitPrice) {
        errors[`${idx}_compareAtPrice`] = "MRP must be ≥ Selling Price";
      }
    });

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      toast({
        title: "Please fix validation errors",
        description: "Ensure all component titles, prices, and slabs are valid.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleSaveAndSync = async () => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const sanitizedComponents = components.map((c, idx) => {
        const uPrice = Math.round((parseFloat(c.unitPrice) || 0) * 100) / 100;
        const rawComp = parseFloat(c.compareAtPrice);
        const cPrice = !isNaN(rawComp) && rawComp >= uPrice ? Math.round(rawComp * 100) / 100 : uPrice;
        const matchedSlab = gstSlabs.find((s) => s.id === c.gstSlabId) || gstSlabs[0];

        return {
          id: c.id,
          componentTitle: (c.componentTitle || "").trim(),
          quantity: Math.max(1, parseInt(c.quantity, 10) || 1),
          unitPrice: uPrice,
          compareAtPrice: cPrice,
          gstSlabId: c.gstSlabId || matchedSlab?.id,
          hsnSacCode: (c.hsnSacCode || "4901").trim(),
          sortOrder: idx,
        };
      });

      let returnedComponents = sanitizedComponents;
      const isUUID = (str) =>
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          String(str)
        );

      // If existing product & variant exist in backend, invoke remote API
      if (productId && variant.id && isUUID(productId) && isUUID(variant.id)) {
        const remoteRes = await kitService.saveVariantComponents(
          productId,
          variant.id,
          sanitizedComponents
        );
        const serverItems = remoteRes?.data?.components || remoteRes?.components;
        if (Array.isArray(serverItems) && serverItems.length > 0) {
          returnedComponents = serverItems;
        }
      }

      toast({
        title: "Kit Components Synced",
        description: `Successfully configured ${returnedComponents.length} components for variant '${variant.name || "Default Variant"}'.`,
      });

      if (onSaveSuccess) {
        onSaveSuccess({
          variantIndex,
          variantId: variant.id,
          price: roundedTotalPrice,
          compareAtPrice: roundedTotalCompareAt,
          discount: Math.max(0, discountPercent),
          components: returnedComponents,
          isSplitGst: true,
          gstSlabId: null, // Marks row as Split / Multi-GST
        });
      }

      onClose();
    } catch (err) {
      console.error("Failed to save kit components:", err);
      toast({
        title: "Save Failed",
        description:
          err.response?.data?.message ||
          err.message ||
          "Could not save kit components. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[90vh]">
        {/* ── Modal Header ── */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-400/30">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">
                  Kit Component Breakdown
                </h3>
                <Badge
                  variant="outline"
                  className="bg-indigo-500/10 text-indigo-300 border-indigo-400/30 text-xs py-0.5 px-2"
                >
                  Mixed Supply Tax Optimization
                </Badge>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-1.5 font-medium">
                Variant:{" "}
                <span className="text-white font-semibold bg-white/10 px-2 py-0.5 rounded">
                  {variant.name || "Selected Variant"}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Legal / Mixed Supply Compliance Notice ── */}
        <div className="bg-amber-50/90 border-b border-amber-200 px-6 py-2.5 flex items-center gap-3 text-xs text-amber-800">
          <ShieldCheck size={16} className="text-amber-600 flex-shrink-0" />
          <span>
            <strong>GST Compliance Benefit:</strong> Itemizing your kit components
            prevents composite/mixed supply tax penalization where highest rate
            applies. Individual items will be taxed at their specific legal rates
            (e.g., 0% for Textbooks, 12% for Notebooks, 18% for Stationery).
          </span>
        </div>

        {/* ── Modal Body / Table ── */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-3">
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <p className="text-sm">Loading loose kit components...</p>
            </div>
          ) : (
            <>
              <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 uppercase font-semibold tracking-wider">
                      <tr>
                        <th className="px-3 py-3 w-8 text-center">#</th>
                        <th className="px-3 py-3 min-w-[180px]">
                          Component Title <span className="text-red-500">*</span>
                        </th>
                        <th className="px-3 py-3 w-20">
                          Qty <span className="text-red-500">*</span>
                        </th>
                        <th className="px-3 py-3 w-28">
                          HSN/SAC <span className="text-red-500">*</span>
                        </th>
                        <th className="px-3 py-3 min-w-[160px]">
                          GST Slab <span className="text-red-500">*</span>
                        </th>
                        <th className="px-3 py-3 w-28">
                          MRP / Comp At (₹) <span className="text-red-500">*</span>
                        </th>
                        <th className="px-3 py-3 w-28">
                          Unit Price (₹) <span className="text-red-500">*</span>
                        </th>
                        <th className="px-3 py-3 w-28 text-right">
                          Line Total (₹)
                        </th>
                        <th className="px-3 py-3 w-12 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {components.map((item, idx) => {
                        const qty = Number(item.quantity) || 0;
                        const price = parseFloat(item.unitPrice) || 0;
                        const lineTotal = Math.round(qty * price * 100) / 100;

                        const titleErr = formErrors[`${idx}_title`];
                        const qtyErr = formErrors[`${idx}_quantity`];
                        const hsnErr = formErrors[`${idx}_hsn`];
                        const slabErr = formErrors[`${idx}_slab`];
                        const compErr = formErrors[`${idx}_compareAtPrice`];
                        const priceErr = formErrors[`${idx}_unitPrice`];

                        return (
                          <tr
                            key={item.id || idx}
                            className="hover:bg-slate-50/60 transition-colors"
                          >
                            <td className="px-3 py-2 text-center font-medium text-slate-400">
                              {idx + 1}
                            </td>

                            {/* Component Title */}
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                placeholder="e.g. Physics & Chemistry Books"
                                className={`w-full px-2.5 py-1.5 rounded-lg border text-xs focus:ring-1 focus:outline-none transition-colors ${titleErr
                                    ? "border-red-400 bg-red-50/50 focus:ring-red-400"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  }`}
                                value={item.componentTitle}
                                onChange={(e) =>
                                  handleFieldChange(
                                    idx,
                                    "componentTitle",
                                    e.target.value
                                  )
                                }
                              />
                              {titleErr && (
                                <p className="text-[10px] text-red-500 mt-0.5">
                                  {titleErr}
                                </p>
                              )}
                            </td>

                            {/* Quantity */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="1"
                                step="1"
                                className={`w-full px-2 py-1.5 rounded-lg border text-xs text-center focus:ring-1 focus:outline-none ${qtyErr
                                    ? "border-red-400 bg-red-50/50 focus:ring-red-400"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  }`}
                                value={item.quantity}
                                onChange={(e) =>
                                  handleFieldChange(
                                    idx,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                              />
                              {qtyErr && (
                                <p className="text-[10px] text-red-500 mt-0.5 text-center">
                                  {qtyErr}
                                </p>
                              )}
                            </td>

                            {/* HSN Code */}
                            <td className="px-3 py-2">
                              <input
                                type="text"
                                placeholder="4901"
                                className={`w-full px-2 py-1.5 rounded-lg border text-xs uppercase font-mono focus:ring-1 focus:outline-none ${hsnErr
                                    ? "border-red-400 bg-red-50/50 focus:ring-red-400"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  }`}
                                value={item.hsnSacCode}
                                onChange={(e) =>
                                  handleFieldChange(
                                    idx,
                                    "hsnSacCode",
                                    e.target.value
                                  )
                                }
                              />
                              {hsnErr && (
                                <p className="text-[10px] text-red-500 mt-0.5">
                                  {hsnErr}
                                </p>
                              )}
                            </td>

                            {/* GST Slab Dropdown */}
                            <td className="px-3 py-2">
                              <select
                                className={`w-full px-2 py-1.5 rounded-lg border text-xs bg-white focus:ring-1 focus:outline-none ${slabErr
                                    ? "border-red-400 bg-red-50/50 focus:ring-red-400"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  }`}
                                value={item.gstSlabId}
                                onChange={(e) =>
                                  handleSlabChange(idx, e.target.value)
                                }
                              >
                                {gstSlabs.map((s) => (
                                  <option key={s.id} value={s.id}>
                                    {s.rate}% — {s.description || `${s.rate}% GST`}
                                  </option>
                                ))}
                              </select>
                              {slabErr && (
                                <p className="text-[10px] text-red-500 mt-0.5">
                                  {slabErr}
                                </p>
                              )}
                            </td>

                            {/* Compare At (MRP) */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className={`w-full px-2 py-1.5 rounded-lg border text-xs text-right focus:ring-1 focus:outline-none ${compErr
                                    ? "border-red-400 bg-red-50/50 focus:ring-red-400"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  }`}
                                value={item.compareAtPrice}
                                onChange={(e) =>
                                  handleFieldChange(
                                    idx,
                                    "compareAtPrice",
                                    e.target.value
                                  )
                                }
                              />
                              {compErr && (
                                <p className="text-[10px] text-red-500 mt-0.5 text-right">
                                  {compErr}
                                </p>
                              )}
                            </td>

                            {/* Selling Price */}
                            <td className="px-3 py-2">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0.00"
                                className={`w-full px-2 py-1.5 rounded-lg border text-xs text-right focus:ring-1 focus:outline-none ${priceErr
                                    ? "border-red-400 bg-red-50/50 focus:ring-red-400"
                                    : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                                  }`}
                                value={item.unitPrice}
                                onChange={(e) =>
                                  handleFieldChange(
                                    idx,
                                    "unitPrice",
                                    e.target.value
                                  )
                                }
                              />
                              {priceErr && (
                                <p className="text-[10px] text-red-500 mt-0.5 text-right">
                                  {priceErr}
                                </p>
                              )}
                            </td>

                            {/* Line Total */}
                            <td className="px-3 py-2 text-right font-semibold text-slate-800">
                              ₹{lineTotal.toLocaleString("en-IN", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </td>

                            {/* Delete Action */}
                            <td className="px-3 py-2 text-center">
                              <button
                                type="button"
                                onClick={() => handleRemoveRow(idx)}
                                title="Remove component"
                                className="text-slate-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* + Add Loose Item Button */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-200 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={handleAddRow}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg hover:bg-indigo-50 border border-indigo-200/60 bg-white transition-all shadow-xs"
                  >
                    <Plus size={14} /> Add Loose Item
                  </button>
                  <span className="text-xs text-slate-500">
                    {components.length} item{components.length === 1 ? "" : "s"} in kit
                  </span>
                </div>
              </div>

              {/* ── Footer Summary Card: Bottom-Up Calculated Sums ── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-br from-indigo-50/60 via-slate-50 to-purple-50/60 p-4 rounded-xl border border-indigo-100/80 shadow-xs">
                {/* Total Selling Price */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Variant Price (Selling)</span>
                    <Calculator size={14} className="text-indigo-600" />
                  </div>
                  <div className="mt-1 text-xl font-bold text-indigo-950">
                    ₹{roundedTotalPrice.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Σ (Qty × Unit Price)
                  </p>
                </div>

                {/* Total Compare At / MRP */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Variant Compare At (MRP)</span>
                    <span className="text-xs text-slate-400">Total MRP</span>
                  </div>
                  <div className="mt-1 text-xl font-bold text-slate-800">
                    ₹{roundedTotalCompareAt.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Σ (Qty × Unit MRP)
                  </p>
                </div>

                {/* Discount % */}
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs">
                  <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
                    <span>Computed Discount</span>
                    <Badge
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]"
                    >
                      Auto-synced
                    </Badge>
                  </div>
                  <div className="mt-1 text-xl font-bold text-emerald-600">
                    {Math.max(0, discountPercent)}% OFF
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    round((MRP - Price) / MRP × 100)
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* ── Modal Footer ── */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Info size={14} className="text-slate-400" />
            <span>
              Saving will lock manual price edits on this variant row and sync the bottom-up totals.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
              className="text-xs h-9 px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveAndSync}
              disabled={saving || loading}
              className="text-xs h-9 px-5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-sm transition-all"
            >
              {saving ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  Saving & Syncing...
                </>
              ) : (
                "Save & Sync to Variant"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
