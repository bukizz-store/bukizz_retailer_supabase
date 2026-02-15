import React, { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { ChevronRight, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function CategorySelector({ onSelect }) {
  // Columns array. Each item is { parentId, categories: [], selectedId }
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);

  // Initial load: fetch root categories
  useEffect(() => {
    fetchCategories(null, 0);
  }, []);

  const fetchCategories = async (parentId, columnIndex) => {
    setLoading(true);
    try {
      const res_data = await productService.getCategories({ parentId });
      const data = res_data.categories;
      console.log("data", data);
      setColumns((prev) => {
        // Slice to remove any columns deeper than the current one we are refreshing
        const newCols = prev.slice(0, columnIndex);

        // Only add a new column if we found categories
        if (data && data.length > 0) {
          newCols.push({
            parentId,
            categories: data,
            selectedId: null,
          });
        }
        return newCols;
      });

      // If no children found for a selected parent (and it's not the initial root load),
      // it effectively means the parent is a leaf node.
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (category, columnIndex) => {
    // Update selection for this column
    setColumns((prev) => {
      const newCols = [...prev];
      newCols[columnIndex].selectedId = category.id;
      // Remove any deeper columns immediately
      return newCols.slice(0, columnIndex + 1);
    });

    // Fetch children for the next column
    fetchCategories(category.id, columnIndex + 1);
  };

  // Derived state: Get the last selected category to enable "Confirm"
  const getLastSelectedCategory = () => {
    if (columns.length === 0) return null;

    // Find the deepest column with a selection
    const lastWithSelection = [...columns]
      .reverse()
      .find((col) => col.selectedId);
    if (!lastWithSelection) return null;

    return lastWithSelection.categories.find(
      (c) => c.id === lastWithSelection.selectedId,
    );
  };

  const selectedCategory = getLastSelectedCategory();
  // Check if the currently selected category has children displayed in the next column
  // If a column exists AFTER the one containing the selection, it means there are children.
  const selectedColIndex = columns.findIndex(
    (col) => col.selectedId === selectedCategory?.id,
  );
  const hasChildren = columns.length > selectedColIndex + 1;

  return (
    <div className="flex flex-col h-[600px] w-full">
      <div className="flex-1 flex overflow-x-auto gap-px border bg-slate-200 rounded-lg">
        {columns.map((col, colIndex) => (
          <div
            key={col.parentId || "root"}
            className="w-80 flex-shrink-0 bg-white first:rounded-l-lg last:rounded-r-lg border-r border-slate-100 overflow-y-auto"
          >
            <div className="p-3 sticky top-0 bg-white border-b border-slate-100 font-medium text-sm text-slate-500">
              {colIndex === 0 ? "Root Categories" : "Sub Categories"}
            </div>
            <div className="p-2 space-y-1">
              {col.categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat, colIndex)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm text-left transition-colors",
                    col.selectedId === cat.id
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50",
                  )}
                >
                  <span>{cat.name}</span>
                  {col.selectedId === cat.id && (
                    <ChevronRight className="h-4 w-4 text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Loading State or End State */}
        <div className="flex-1 min-w-[300px] bg-slate-50 flex items-center justify-center p-8">
          {loading ? (
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-2" />
              <p className="text-sm text-slate-500">Loading Categories...</p>
            </div>
          ) : selectedCategory && !hasChildren ? (
            <div className="text-center max-w-sm">
              <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">
                {selectedCategory.name}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                Correct category selected? Click confirm to proceed with this
                category.
              </p>
              <Button
                onClick={() => onSelect(selectedCategory)}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              >
                Confirm & Proceed
              </Button>
            </div>
          ) : (
            <div className="text-center text-slate-400">
              <p>Select a category to view sub-categories</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
