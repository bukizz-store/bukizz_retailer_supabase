import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Package,
  Tag,
  Layers,
  Edit2,
  Trash2,
  X,
  Loader2,
  Box,
  BarChart3,
  Eye,
} from "lucide-react";
import { productService } from "@/services/productService";
import { useToast } from "@/context/ToastContext";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(null);

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await productService.getProductById(productId);
        const data =
          response?.data?.product ||
          response?.product ||
          response?.data ||
          response;
        setProduct(data);
        // Set initial active image
        const imgs = data?.images || data?.mainImages || [];
        if (imgs.length > 0) {
          setActiveImage(imgs[0].url || imgs[0]);
        }
      } catch (error) {
        console.error("Failed to fetch product:", error);
        toast({
          title: "Failed to load product",
          description: error.response?.data?.error || "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await productService.deleteProduct(productId);
      toast({ title: "Product deleted successfully", variant: "default" });
      navigate("/dashboard/inventory/general");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast({
        title: "Failed to delete product",
        description: error.response?.data?.error || "Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading product details…</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Package className="h-16 w-16 text-slate-300" />
        <h2 className="text-xl font-semibold text-slate-700">
          Product not found
        </h2>
        <Button
          variant="outline"
          onClick={() => navigate("/dashboard/inventory/general")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Products
        </Button>
      </div>
    );
  }

  // ── Derived data ──
  const images = product.images || product.mainImages || [];
  const totalStock = product.variants?.reduce(
    (acc, v) => acc + (v.stock || 0),
    0,
  );
  const categories = product.product_categories
    ?.map((pc) => pc.categories?.name)
    .filter(Boolean)
    .join(", ");
  const brandName =
    product.brand?.name ||
    product.brands?.name ||
    product.brandData?.name ||
    null;

  const getStockBadge = (stock) => {
    if (stock === 0) return { variant: "rejected", label: "Out of stock" };
    if (stock < 10) return { variant: "warning", label: "Low stock" };
    return { variant: "live", label: "In stock" };
  };

  return (
    <div className="space-y-6">
      {/* ── Breadcrumbs & Actions ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 text-sm text-slate-500">
          <button
            onClick={() => navigate("/dashboard/overview")}
            className="hover:text-blue-600 transition-colors"
          >
            Home
          </button>
          <ChevronRight size={14} />
          <button
            onClick={() => navigate("/dashboard/inventory/general")}
            className="hover:text-blue-600 transition-colors"
          >
            General Store
          </button>
          <ChevronRight size={14} />
          <span className="font-medium text-slate-900 truncate max-w-[200px]">
            {product.title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigate(`/dashboard/inventory/general/edit/${productId}`)
            }
          >
            <Edit2 className="h-4 w-4 mr-1.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Image Gallery */}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm aspect-square flex items-center justify-center overflow-hidden relative">
            {activeImage ? (
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-slate-300 gap-2">
                <Package size={48} />
                <span className="text-sm">No Image Available</span>
              </div>
            )}

            {/* Status badge overlay */}
            <div className="absolute top-3 left-3">
              <span
                className={cn(
                  "text-xs font-bold px-2.5 py-1 rounded-full border shadow-sm",
                  product.is_active
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
                )}
              >
                {product.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((img, idx) => {
                const url = img.url || img;
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(url)}
                    className={cn(
                      "w-16 h-16 rounded-lg border-2 shrink-0 overflow-hidden transition-all",
                      activeImage === url
                        ? "border-blue-500 ring-2 ring-blue-500/20"
                        : "border-slate-200 hover:border-slate-300",
                    )}
                  >
                    <img
                      src={url}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Product Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Title & Price card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex flex-col gap-4">
              {/* Title + Status + Price */}
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-slate-900 mb-1.5">
                    {product.title}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={cn(
                        "w-2 h-2 rounded-full",
                        product.is_active ? "bg-emerald-500" : "bg-red-400",
                      )}
                    />
                    <span className="text-sm text-slate-600">
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="text-sm text-slate-500">
                      SKU:{" "}
                      <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                        {product.sku}
                      </code>
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-3xl font-bold text-slate-900">
                    ₹
                    {product.base_price?.toLocaleString() ||
                      product.basePrice?.toLocaleString() ||
                      "—"}
                  </div>
                  <div className="text-sm text-slate-500 mt-0.5">
                    Base Price
                  </div>
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* Context Cards */}
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-500 shrink-0">
                    <Tag size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Category
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {categories || "Uncategorized"}
                    </div>
                  </div>
                </div>

                {/* Brand */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-500 shrink-0">
                    <Layers size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Brand
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {brandName || "No brand"}
                    </div>
                  </div>
                </div>

                {/* Total Stock */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-500 shrink-0">
                    <Box size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Total Stock
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {totalStock ?? "—"} units
                    </div>
                  </div>
                </div>

                {/* Variants count */}
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-500 shrink-0">
                    <BarChart3 size={18} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                      Variants
                    </div>
                    <div className="text-sm font-medium text-slate-900">
                      {product.variants?.length || 0} variant(s)
                    </div>
                  </div>
                </div>
              </div>

              {/* Highlights */}
              {product.highlight &&
                Object.keys(product.highlight).length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-3">
                      Highlights
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                      {Object.entries(product.highlight).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex justify-between border-b border-slate-50 py-2"
                        >
                          <span className="text-sm text-slate-500">{key}</span>
                          <span className="text-sm font-medium text-slate-700 text-right">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Short Description */}
              {product.short_description && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">
                    Short Description
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {product.short_description}
                  </p>
                </div>
              )}

              {/* Full Description */}
              {product.description && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 mb-2">
                    Description
                  </h3>
                  <div
                    className="prose prose-sm text-slate-600 max-w-none"
                    dangerouslySetInnerHTML={{ __html: product.description }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Variants Inventory Table ── */}
      {product.variants && product.variants.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">
              Variants & Inventory
            </h2>
            <div className="text-sm text-slate-500">
              Total Stock:{" "}
              <span className="font-semibold text-slate-900">{totalStock}</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
                <tr>
                  {/* Dynamic option headers */}
                  {product.variants[0]?.option_value_1_ref && (
                    <th className="py-3 px-4">
                      {product.variants[0].option_value_1_ref.attribute_name ||
                        "Option 1"}
                    </th>
                  )}
                  {product.variants[0]?.option_value_2_ref && (
                    <th className="py-3 px-4">
                      {product.variants[0].option_value_2_ref.attribute_name ||
                        "Option 2"}
                    </th>
                  )}
                  {product.variants[0]?.option_value_3_ref && (
                    <th className="py-3 px-4">
                      {product.variants[0].option_value_3_ref.attribute_name ||
                        "Option 3"}
                    </th>
                  )}
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Compare</th>
                  <th className="py-3 px-4">Stock</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {product.variants.map((variant) => {
                  const stock = variant.stock || 0;
                  const badge = getStockBadge(stock);
                  const price = variant.variant_price ?? variant.price ?? 0;
                  const comparePrice =
                    variant.compare_at_price ?? variant.compareAtPrice ?? null;

                  return (
                    <tr
                      key={variant.id}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      {product.variants[0]?.option_value_1_ref && (
                        <td className="py-3 px-4 font-medium text-slate-900">
                          <div className="flex items-center gap-2">
                            {variant.option_value_1_ref?.image_url && (
                              <img
                                src={variant.option_value_1_ref.image_url}
                                alt=""
                                className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200"
                              />
                            )}
                            {variant.option_value_1_ref?.value || "—"}
                          </div>
                        </td>
                      )}
                      {product.variants[0]?.option_value_2_ref && (
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {variant.option_value_2_ref?.value || "—"}
                        </td>
                      )}
                      {product.variants[0]?.option_value_3_ref && (
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {variant.option_value_3_ref?.value || "—"}
                        </td>
                      )}
                      <td className="py-3 px-4 text-slate-500">
                        <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">
                          {variant.sku || "—"}
                        </code>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        ₹{price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500">
                        {comparePrice ? (
                          <span className="line-through">
                            ₹{comparePrice.toLocaleString()}
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3 px-4 font-medium">{stock}</td>
                      <td className="py-3 px-4">
                        <Badge variant={badge.variant} dot>
                          {badge.label}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl animate-in fade-in-0 zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">
                Delete Product
              </h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete <strong>{product.title}</strong>?
              This action cannot be undone.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700 text-white border-none"
              >
                {isDeleting && (
                  <Loader2 size={16} className="animate-spin mr-2" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
