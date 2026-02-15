import React, { useState, useEffect } from "react";
import { productService } from "@/services/productService";
import { Input } from "@/components/ui/Input";
import { Search, Loader2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function BrandSelector({ onSelect }) {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState(null);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    try {
      const data = await productService.getBrands({ limit: 100 });
      setBrands(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filter brands locally based on search
  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full min-h-[500px]">
      {/* Header with Search */}
      <div className="flex items-center justify-between mb-6">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search brands..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto pr-2">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : filteredBrands.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            No brands found matching "{search}"
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {filteredBrands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => setSelectedBrand(brand)}
                className={cn(
                  "relative flex flex-col items-center justify-center p-6 border-2 rounded-xl transition-all hover:shadow-md h-32",
                  selectedBrand?.id === brand.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-slate-100 bg-white hover:border-orange-200",
                )}
              >
                <span className="font-semibold text-slate-900 text-center line-clamp-2">
                  {brand.name}
                </span>
                {selectedBrand?.id === brand.id && (
                  <div className="absolute top-2 right-2 h-5 w-5 bg-orange-500 text-white rounded-full flex items-center justify-center">
                    <Check className="h-3 w-3" />
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-end pt-4 border-t border-slate-100">
        <Button
          disabled={!selectedBrand}
          onClick={() => onSelect(selectedBrand)}
          className="bg-orange-600 hover:bg-orange-700 text-white"
        >
          Confirm Brand
        </Button>
      </div>
    </div>
  );
}
