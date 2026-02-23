import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { productService } from "@/services/productService";
import { useWarehouse } from "@/context/WarehouseContext";
import { useToast } from "@/context/ToastContext";
import {
  Plus,
  Search,
  Filter,
  Package,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
import StockUpdateModal from "@/components/dashboard/inventory/StockUpdateModal";

const categories = [
  { id: "all", label: "All Products", icon: "📦" },
  { id: "bags", label: "Bags", icon: "🎒" },
  { id: "bottles", label: "Bottles", icon: "🍶" },
  { id: "stationery", label: "Stationery", icon: "✏️" },
  { id: "art_supplies", label: "Art Supplies", icon: "🎨" },
  { id: "general_books", label: "General Books", icon: "📚" },
];

export default function GeneralStorePage() {
  const { activeWarehouse } = useWarehouse();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 1,
  });

  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    status: "",
  });

  // Stock update modal
  const [stockEditProduct, setStockEditProduct] = useState(null);

  // Debounce search
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const fetchProducts = useCallback(async () => {
    if (!activeWarehouse?.id) return;

    setLoading(true);
    try {
      const response = await productService.getProductsByWarehouseId({
        warehouseId: activeWarehouse.id,
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch,
        categoryId: filters.category === "all" ? "" : filters.category,
        status: filters.status,
        productType: "general",
      });

      console.log(response);
      if (response.success) {
        setProducts(response.data.products);
        setPagination((prev) => ({
          ...prev,
          ...response.data.pagination,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      toast({
        title: "Failed to load products",
        description: error.response?.data?.error || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [
    activeWarehouse,
    pagination.page,
    pagination.limit,
    debouncedSearch,
    filters.category,
    filters.status,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (e) => {
    setFilters((prev) => ({ ...prev, search: e.target.value }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on search
  };

  const handleCategoryChange = (catId) => {
    setFilters((prev) => ({ ...prev, category: catId }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header with Add Product Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">General Store</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your product catalog and inventory for{" "}
            {activeWarehouse?.name || "Loading..."}
          </p>
        </div>
        <Link
          to="/dashboard/inventory/general/add"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <Plus className="h-4 w-4" />
          Add Product
        </Link>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryChange(category.id)}
            className={`flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              filters.category === category.id
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span>{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1">
          <Input
            placeholder="Search by name or SKU..."
            value={filters.search}
            onChange={handleSearchChange}
            icon={<Search className="h-5 w-5" />}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>

      {/* Products Table */}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Product
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  SKU
                </th>
                <th className="hidden px-6 py-4 text-left text-sm font-semibold text-slate-900 md:table-cell">
                  Type
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  Price
                </th>
                <th className="hidden px-6 py-4 text-right text-sm font-semibold text-slate-900 sm:table-cell">
                  Stock
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-20 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
                      <p>Loading inventory...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-slate-500 font-medium">
                      No products found
                    </p>
                    <p className="text-xs mt-1">
                      Try adjusting your search or filters.
                    </p>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4" />
                      Add your first product
                    </Button>
                  </td>
                </tr>
              ) : (
                products.map((product) => (
                  <tr
                    key={product.id}
                    className="group transition-colors hover:bg-slate-50"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Package className="h-6 w-6 text-slate-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900">
                            {product.title}
                          </p>
                          <p className="text-sm text-slate-500">
                            {product.variants?.length || 0} variants
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded bg-slate-100 px-2 py-1 text-sm text-slate-600">
                        {product.sku}
                      </code>
                    </td>
                    <td className="hidden px-6 py-4 md:table-cell">
                      <Badge variant="default" className="capitalize">
                        {product.productType || "Standard"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex flex-col items-end">
                        <span className="font-semibold text-slate-900">
                          ₹{product.basePrice?.toLocaleString()}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-6 py-4 text-right sm:table-cell">
                      <button
                        onClick={() => setStockEditProduct(product)}
                        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors hover:bg-blue-50 hover:text-blue-700 cursor-pointer ${
                          product.stock < 20
                            ? "text-amber-600"
                            : "text-slate-900"
                        }`}
                        title="Click to update stock"
                      >
                        {product.stock}
                        <Edit className="h-3 w-3 opacity-0 group-hover:opacity-100 text-slate-400" />
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="live" dot>
                        Active
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                          onClick={() =>
                            navigate(
                              `/dashboard/inventory/general/${product.id}`,
                            )
                          }
                          title="View product"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                          title="Edit product"
                          onClick={() =>
                            navigate(
                              `/dashboard/inventory/general/edit/${product.id}`,
                            )
                          }
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          title="Delete product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
          <span>
            Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.totalItems,
            )}{" "}
            of {pagination.totalItems} products
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
            >
              Previous
            </Button>
            <span className="px-2">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {stockEditProduct && (
        <StockUpdateModal
          product={stockEditProduct}
          onClose={() => setStockEditProduct(null)}
          onUpdated={fetchProducts}
          toast={toast}
        />
      )}
    </div>
  );
}
