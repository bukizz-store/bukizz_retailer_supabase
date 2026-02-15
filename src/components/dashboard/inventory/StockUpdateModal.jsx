import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { productService } from "@/services/productService";
import { X, Package, Minus, Plus, Loader2, Save } from "lucide-react";

const OPERATIONS = [
  { value: "set", label: "Set to" },
  { value: "increment", label: "Add" },
  { value: "decrement", label: "Remove" },
];

export default function StockUpdateModal({ product, onClose, onUpdated, toast }) {
  const variants = product?.variants || [];
  const hasVariants = variants.length > 0;

  // Each entry tracks the editable state for a variant row
  const [variantEdits, setVariantEdits] = useState([]);
  const [saving, setSaving] = useState(false);

  // Initialise editable rows from product variants
  useEffect(() => {
    if (!product) return;

    if (hasVariants) {
      setVariantEdits(
        variants.map((v) => ({
          variantId: v.id,
          sku: v.sku || product.sku,
          label: buildVariantLabel(v),
          currentStock: v.stock ?? 0,
          quantity: "",
          operation: "set",
          dirty: false,
        })),
      );
    } else {
      // Product without variants — cannot update stock via variant API
      setVariantEdits([]);
    }
  }, [product]);

  function buildVariantLabel(variant) {
    const parts = [variant.optionValue1, variant.optionValue2, variant.optionValue3].filter(Boolean);
    return parts.length > 0 ? parts.join(" / ") : variant.sku || "Variant";
  }

  // ── Field handlers ──
  const updateField = (index, field, value) => {
    setVariantEdits((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value, dirty: true } : row,
      ),
    );
  };

  const handleQuantityChange = (index, value) => {
    // Allow only positive integers (or empty for clearing)
    if (value === "" || /^\d+$/.test(value)) {
      updateField(index, "quantity", value);
    }
  };

  // ── Quick adjust buttons (±1, ±5, ±10) ──
  const quickAdjust = (index, delta) => {
    setVariantEdits((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        const current = parseInt(row.quantity, 10) || 0;
        const newVal = Math.max(0, current + delta);
        return { ...row, quantity: String(newVal), operation: "set", dirty: true };
      }),
    );
  };

  // ── Save ──
  const dirtyRows = variantEdits.filter((r) => r.dirty && r.quantity !== "");

  const handleSave = async () => {
    if (dirtyRows.length === 0) return;

    setSaving(true);
    try {
      if (dirtyRows.length === 1) {
        // Single update
        const row = dirtyRows[0];
        await productService.updateVariantStock(row.variantId, {
          quantity: parseInt(row.quantity, 10),
          operation: row.operation,
        });
      } else {
        // Bulk update
        const updates = dirtyRows.map((row) => ({
          variantId: row.variantId,
          quantity: parseInt(row.quantity, 10),
          operation: row.operation,
        }));
        await productService.bulkUpdateVariantStock(updates);
      }

      toast?.({
        title: "Stock updated",
        description: `Successfully updated stock for ${dirtyRows.length} variant${dirtyRows.length > 1 ? "s" : ""}.`,
        variant: "success",
      });
      onUpdated?.(); // Trigger parent refetch
      onClose();
    } catch (error) {
      console.error("Stock update failed:", error);
      toast?.({
        title: "Stock update failed",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (!product) return null;

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      {/* Modal */}
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in fade-in zoom-in-95">
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">
                Update Stock
              </h2>
              <p className="truncate text-sm text-slate-500">{product.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
          {variantEdits.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Package className="h-10 w-10 text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-700">No variants found</p>
              <p className="text-xs text-slate-500 mt-1">
                This product has no variants. Add variants to manage stock levels.
              </p>
            </div>
          ) : (
          <div className="space-y-4">
            {variantEdits.map((row, index) => (
              <div
                key={row.variantId}
                className="rounded-lg border border-slate-200 bg-slate-50/50 p-4 space-y-3"
              >
                {/* Variant header */}
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {row.label}
                    </p>
                    <p className="text-xs text-slate-500">SKU: {row.sku}</p>
                  </div>
                  <Badge
                    variant={row.currentStock < 20 ? "warning" : "success"}
                  >
                    Current: {row.currentStock}
                  </Badge>
                </div>

                {/* Controls row */}
                <div className="flex flex-wrap items-end gap-3">
                  {/* Operation selector */}
                  <div className="w-36">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Operation
                    </label>
                    <select
                      value={row.operation}
                      onChange={(e) =>
                        updateField(index, "operation", e.target.value)
                      }
                      className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                      {OPERATIONS.map((op) => (
                        <option key={op.value} value={op.value}>
                          {op.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Quantity input */}
                  <div className="flex-1 min-w-[120px]">
                    <label className="mb-1.5 block text-xs font-medium text-slate-600">
                      Quantity
                    </label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => quickAdjust(index, -1)}
                        disabled={parseInt(row.quantity, 10) <= 0}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-40"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={row.quantity}
                        onChange={(e) =>
                          handleQuantityChange(index, e.target.value)
                        }
                        placeholder="0"
                        className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-center text-sm text-slate-900 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <button
                        type="button"
                        onClick={() => quickAdjust(index, 1)}
                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-50"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview */}
                  {row.quantity !== "" && (
                    <div className="flex-shrink-0 text-right">
                      <label className="mb-1.5 block text-xs font-medium text-slate-600">
                        New Stock
                      </label>
                      <p className="h-10 flex items-center justify-end text-sm font-semibold text-blue-600">
                        {computePreview(row)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
          <p className="text-xs text-slate-500">
            {dirtyRows.length > 0
              ? `${dirtyRows.length} variant${dirtyRows.length > 1 ? "s" : ""} will be updated`
              : "Enter a quantity to update"}
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={dirtyRows.length === 0}
              loading={saving}
              onClick={handleSave}
            >
              <Save className="h-4 w-4" />
              {dirtyRows.length > 1 ? "Bulk Update" : "Update Stock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Compute a preview of the resulting stock value */
function computePreview(row) {
  const qty = parseInt(row.quantity, 10) || 0;
  switch (row.operation) {
    case "increment":
      return row.currentStock + qty;
    case "decrement":
      return Math.max(0, row.currentStock - qty);
    case "set":
    default:
      return qty;
  }
}
