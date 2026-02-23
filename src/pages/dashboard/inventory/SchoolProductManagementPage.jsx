import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import useSchoolStore from "@/store/schoolStore";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  GraduationCap,
  MapPin,
  Package,
  Plus,
  Search,
  Grid,
  List,
  BookOpen,
  Edit,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  RefreshCw,
  Users,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  ShoppingBag,
  Clock,
  ChevronRight,
  CheckCircle,
  XCircle,
} from "lucide-react";

const ALL_CATEGORIES = [
  { id: "all", label: "All", icon: "📦" },
  { id: "bookset", label: "Bookset", icon: "📚" },
  { id: "school", label: "School", icon: "🏫" },
  { id: "stationary", label: "Stationery", icon: "✏️" },
  { id: "uniform", label: "Uniforms", icon: "👔" },
  { id: "general", label: "General", icon: "🎒" },
];

export default function SchoolProductManagementPage() {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("my_products");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const {
    schoolDetail,
    isLoadingSchoolDetail,
    schoolDetailError,
    schoolProducts,
    schoolAnalytics,
    fetchAllSchoolData,
    clearSchoolDetail,
    connectedSchools,
  } = useSchoolStore();

  // Resolve the retailer's allowed product types for this school.
  // Priority: route state (passed from MySchoolsPage) → fallback to store lookup.
  const allowedTypes = useMemo(() => {
    // 1. Passed via navigation state
    if (location.state?.allowedTypes?.length) {
      return location.state.allowedTypes;
    }
    // 2. Fallback: look up in approved connected schools
    const entry = connectedSchools.approved.find(
      (e) => e.schoolId === schoolId,
    );
    if (entry?.productType?.length) {
      return entry.productType;
    }
    return null; // null means "no restriction info available — show all"
  }, [location.state, connectedSchools.approved, schoolId]);

  // Build the filtered category tabs based on allowed types
  const schoolCategories = useMemo(() => {
    if (!allowedTypes) return ALL_CATEGORIES; // show all when info unavailable
    return [
      ALL_CATEGORIES[0], // always include "All"
      ...ALL_CATEGORIES.filter(
        (cat) => cat.id !== "all" && allowedTypes.includes(cat.id),
      ),
    ];
  }, [allowedTypes]);

  // Fetch all school data on mount (single API call)
  useEffect(() => {
    if (schoolId) {
      fetchAllSchoolData(schoolId);
    }
    return () => {
      clearSchoolDetail();
    };
  }, [schoolId]);

  // Reset selected category if it's no longer in the allowed list
  useEffect(() => {
    if (
      selectedCategory !== "all" &&
      allowedTypes &&
      !allowedTypes.includes(selectedCategory)
    ) {
      setSelectedCategory("all");
    }
  }, [allowedTypes, selectedCategory]);

  const handleRetry = () => {
    if (schoolId) fetchAllSchoolData(schoolId);
  };

  const school = schoolDetail || {};
  const isPageLoading = isLoadingSchoolDetail && !schoolDetail;
  const hasError = schoolDetailError && !schoolDetail;

  // Build full address from nested address object
  const addressLine = [school.address?.line1, school.address?.line2]
    .filter(Boolean)
    .join(", ");
  const fullAddress = [
    addressLine,
    school.city,
    school.state,
    school.postal_code || school.postalCode,
  ]
    .filter(Boolean)
    .join(", ");

  // Contact fields from nested contact object
  const contactPhone = school.contact?.phone || school.phone;
  const contactEmail = school.contact?.email || school.email;
  const contactWebsite = school.contact?.website || school.website;

  // Analytics from the response
  const analytics = schoolAnalytics || {};
  const totalProducts = analytics.totalProducts ?? schoolProducts.length;
  const totalStudents = analytics.totalStudents ?? 0;
  const totalOrders = analytics.totalOrders ?? 0;

  // Client-side filtering of products (all products come from the single API call)
  const filteredProducts = useMemo(() => {
    let products = schoolProducts;

    // First, restrict to only product types the retailer is allowed for this school
    if (allowedTypes) {
      products = products.filter((p) => allowedTypes.includes(p.product_type));
    }

    // Filter by selected category tab
    if (selectedCategory !== "all") {
      products = products.filter((p) => p.product_type === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      products = products.filter(
        (p) =>
          (p.title || "").toLowerCase().includes(q) ||
          (p.sku || "").toLowerCase().includes(q) ||
          (p.description || "").toLowerCase().includes(q),
      );
    }

    return products;
  }, [schoolProducts, selectedCategory, searchQuery, allowedTypes]);

  // Separate products by approval-like states (also scoped to allowed types)
  const pendingProducts = useMemo(() => {
    let products = schoolProducts.filter((p) => !p.is_active && !p.is_deleted);
    if (allowedTypes) {
      products = products.filter((p) => allowedTypes.includes(p.product_type));
    }
    return products;
  }, [schoolProducts, allowedTypes]);
  const rejectedProducts = []; // No rejection field in current API — placeholder for future

  const tabs = [
    {
      id: "my_products",
      label: "Listed Products",
      count: filteredProducts.length,
    },
    {
      id: "track_approvals",
      label: "Track Approvals",
      count: pendingProducts.length,
    },
    { id: "analytics", label: "Analytics", count: 0 },
  ];

  // ── Full-page Loading State ────────────────────────────────────
  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="mt-4 text-sm text-slate-500">Loading school details…</p>
      </div>
    );
  }

  // ── Full-page Error State ──────────────────────────────────────
  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
        <p className="text-lg font-medium text-slate-700">
          Failed to load school
        </p>
        <p className="text-sm text-slate-500 mt-1 mb-6 max-w-sm text-center">
          {schoolDetailError}
        </p>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard/inventory/schools")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Schools
          </Button>
          <Button onClick={handleRetry}>
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back Navigation */}
      <button
        onClick={() => navigate("/dashboard/inventory/schools")}
        className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to My Schools
      </button>

      {/* School Hero Section */}
      <div className="rounded-xl border border-slate-200 bg-gradient-to-r from-violet-600 to-blue-600 p-8 text-white shadow-lg">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            {school.image ? (
              <img
                src={school.image}
                alt={school.name}
                className="h-16 w-16 rounded-xl object-cover flex-shrink-0 border-2 border-white/30"
              />
            ) : (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <GraduationCap className="h-8 w-8 text-white" />
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold">{school.name || "School"}</h1>
              {fullAddress && (
                <div className="flex items-center gap-2 mt-2 text-white/80">
                  <MapPin className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm">{fullAddress}</p>
                </div>
              )}
              {school.board && (
                <div className="flex flex-wrap gap-2 mt-3">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    {school.board} Board
                  </span>
                  {school.type && (
                    <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm capitalize">
                      {school.type}
                    </span>
                  )}
                </div>
              )}
              {/* Contact info */}
              <div className="flex flex-wrap gap-4 mt-3">
                {contactPhone && (
                  <span className="flex items-center gap-1.5 text-xs text-white/70">
                    <Phone className="w-3.5 h-3.5" /> {contactPhone}
                  </span>
                )}
                {contactEmail && (
                  <span className="flex items-center gap-1.5 text-xs text-white/70">
                    <Mail className="w-3.5 h-3.5" /> {contactEmail}
                  </span>
                )}
                {contactWebsite && (
                  <a
                    href={contactWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-white/70 hover:text-white transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" /> Website
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats card */}
          <div className="flex gap-4 flex-wrap">
            <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm text-center min-w-[100px]">
              <Package className="h-5 w-5 mx-auto mb-1 text-white/70" />
              <p className="text-3xl font-bold">{totalProducts}</p>
              <p className="text-xs text-white/80 mt-1">Products</p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {schoolCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              "flex flex-shrink-0 items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              selectedCategory === category.id
                ? "bg-blue-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            )}
          >
            <span>{category.icon}</span>
            {category.label}
          </button>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
              activeTab === tab.id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-600 hover:text-slate-900",
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  activeTab === tab.id
                    ? "bg-blue-100 text-blue-700"
                    : "bg-slate-100 text-slate-600",
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Products sub-header: search + view toggle + Add Product button */}
      {activeTab === "my_products" && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
            className="w-full sm:w-64"
          />
          <div className="flex items-center gap-3">
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "grid"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-400 hover:bg-slate-50",
                )}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "p-2 transition-colors",
                  viewMode === "list"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-400 hover:bg-slate-50",
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button
              onClick={() =>
                navigate(`/dashboard/inventory/schools/${schoolId}/add`, {
                  state: { allowedTypes, schoolName: school.name || "School" },
                })
              }
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Button>
          </div>
        </div>
      )}

      {/* ── Tab Content: My Products ─────────────────────────────── */}
      {activeTab === "my_products" && (
        <>
          {/* Products Grid/List View */}
          {filteredProducts.length > 0 && (
            <>
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5"
                    >
                      {/* Product Image */}
                      <div className="aspect-square bg-slate-100 flex items-center justify-center p-6 overflow-hidden">
                        {product.primaryImage ||
                        product.image_url ||
                        (product.images && product.images[0]?.url) ? (
                          <img
                            src={
                              product.primaryImage ||
                              product.image_url ||
                              product.images[0]?.url
                            }
                            alt={product.title || product.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <Package className="h-16 w-16 text-slate-300" />
                        )}
                      </div>
                      <div className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium text-slate-900 line-clamp-2 text-sm">
                              {product.title || product.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-1">
                              {product.sku || "—"}
                            </p>
                          </div>
                          {product.is_active !== undefined && (
                            <Badge
                              variant={product.is_active ? "live" : "rejected"}
                              dot
                            >
                              {product.is_active ? "Active" : "Inactive"}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-bold text-slate-900">
                            ₹{product.base_price ?? "—"}
                          </p>
                          {product.product_type && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-500 capitalize">
                              {product.product_type}
                            </span>
                          )}
                        </div>
                        {/* Grade & mandatory from schoolInfo */}
                        {product.schoolInfo && (
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-blue-600 font-medium">
                              Grade: {product.schoolInfo.grade}
                            </p>
                            {product.schoolInfo.mandatory && (
                              <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                Mandatory
                              </span>
                            )}
                          </div>
                        )}
                        <div className="flex items-center gap-1 mt-3 pt-3 border-t border-slate-100">
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/inventory/general/${product.id}`,
                                { state: { schoolId } },
                              )
                            }
                            className="flex-1 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                          >
                            <Eye className="h-4 w-4 mx-auto" />
                          </button>
                          <button
                            onClick={() =>
                              navigate(
                                `/dashboard/inventory/schools/${schoolId}/edit/${product.id}`,
                                {
                                  state: {
                                    allowedTypes,
                                    schoolName: school.name || "School",
                                  },
                                },
                              )
                            }
                            className="flex-1 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
                          >
                            <Edit className="h-4 w-4 mx-auto" />
                          </button>
                          <button className="flex-1 rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                            <Trash2 className="h-4 w-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* Products List View */
                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                          Product
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                          Type
                        </th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                          Price
                        </th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                          Grade
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
                      {filteredProducts.map((product) => (
                        <tr
                          key={product.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 overflow-hidden">
                                {product.primaryImage ||
                                product.image_url ||
                                (product.images && product.images[0]?.url) ? (
                                  <img
                                    src={
                                      product.primaryImage ||
                                      product.image_url ||
                                      product.images[0]?.url
                                    }
                                    alt={product.title || product.name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <BookOpen className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 text-sm">
                                  {product.title || product.name}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {product.sku || "—"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="default" className="capitalize">
                              {product.product_type || "—"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right font-semibold text-slate-900">
                            ₹{product.base_price ?? "—"}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-700">
                            {product.schoolInfo?.grade || "—"}
                            {product.schoolInfo?.mandatory && (
                              <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-medium">
                                Mandatory
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            {product.is_active !== undefined ? (
                              <Badge
                                variant={
                                  product.is_active ? "live" : "rejected"
                                }
                                dot
                              >
                                {product.is_active ? "Active" : "Inactive"}
                              </Badge>
                            ) : (
                              <span className="text-xs text-slate-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/inventory/general/${product.id}`,
                                    { state: { schoolId } },
                                  )
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() =>
                                  navigate(
                                    `/dashboard/inventory/schools/${schoolId}/edit/${product.id}`,
                                    {
                                      state: {
                                        allowedTypes,
                                        schoolName: school.name || "School",
                                      },
                                    },
                                  )
                                }
                                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Empty Products State */}
          {filteredProducts.length === 0 && (
            <div className="py-16 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-slate-300" />
              <p className="text-lg font-medium text-slate-600">
                No products found
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {searchQuery
                  ? "Try a different search or category"
                  : "No products have been added to this school yet"}
              </p>
              <Button
                className="mt-4"
                onClick={() =>
                  navigate(`/dashboard/inventory/schools/${schoolId}/add`, {
                    state: {
                      allowedTypes,
                      schoolName: school.name || "School",
                    },
                  })
                }
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── Tab Content: Track Approvals ───────────────────────── */}
      {activeTab === "track_approvals" && (
        <div className="space-y-4">
          {/* Pending / Inactive products */}
          {pendingProducts.length > 0 ? (
            pendingProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                    {product.primaryImage ||
                    product.image_url ||
                    (product.images && product.images[0]?.url) ? (
                      <img
                        src={
                          product.primaryImage ||
                          product.image_url ||
                          product.images[0]?.url
                        }
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <BookOpen className="h-6 w-6 text-slate-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {product.title || product.name}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <p className="text-sm text-slate-500">
                        SKU: {product.sku || "—"}
                      </p>
                      <span className="text-slate-300">·</span>
                      <p className="text-sm text-slate-500">
                        ₹{product.base_price ?? "—"}
                      </p>
                      {product.schoolInfo?.grade && (
                        <>
                          <span className="text-slate-300">·</span>
                          <p className="text-sm text-slate-500">
                            Grade: {product.schoolInfo.grade}
                          </p>
                        </>
                      )}
                    </div>
                    {product.created_at && (
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Submitted:{" "}
                        {new Date(product.created_at).toLocaleDateString(
                          "en-IN",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <Badge variant="pending" dot>
                    Under Review
                  </Badge>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-16 text-center">
              <CheckCircle className="mx-auto mb-4 h-12 w-12 text-emerald-300" />
              <p className="text-lg font-medium text-slate-600">
                All products are approved
              </p>
              <p className="mt-2 text-sm text-slate-500">
                No pending approval requests at the moment.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Tab Content: Analytics ───────────────────────────────── */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AnalyticsCard
              icon={<Package className="h-5 w-5 text-blue-500" />}
              label="Total Products"
              value={totalProducts}
              bg="bg-blue-50"
            />
            <AnalyticsCard
              icon={<Users className="h-5 w-5 text-emerald-500" />}
              label="Total Students"
              value={totalStudents}
              bg="bg-emerald-50"
            />
            <AnalyticsCard
              icon={<ShoppingBag className="h-5 w-5 text-green-500" />}
              label="Total Orders"
              value={totalOrders}
              bg="bg-green-50"
            />
            <AnalyticsCard
              icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
              label="Partnerships"
              value={school.partnerships?.length ?? 0}
              bg="bg-amber-50"
            />
          </div>

          {/* School Info Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">
              School Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <InfoItem label="Board" value={school.board} />
              <InfoItem
                label="Type"
                value={school.type}
                className="capitalize"
              />
              <InfoItem label="City" value={school.city} />
              <InfoItem label="State" value={school.state} />
              <InfoItem
                label="Postal Code"
                value={school.postal_code || school.postalCode}
              />
              <InfoItem
                label="Status"
                value={school.is_active ? "Active" : "Inactive"}
              />
              {contactPhone && <InfoItem label="Phone" value={contactPhone} />}
              {contactEmail && <InfoItem label="Email" value={contactEmail} />}
              {contactWebsite && (
                <InfoItem label="Website" value={contactWebsite} isLink />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/** Small analytics stat card */
function AnalyticsCard({ icon, label, value, bg }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            bg,
          )}
        >
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </div>
    </div>
  );
}

/** School info key-value row */
function InfoItem({ label, value, isLink = false, className = "" }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      {isLink ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-blue-600 hover:underline truncate block"
        >
          {value}
        </a>
      ) : (
        <p className={cn("text-sm font-medium text-slate-900", className)}>
          {value}
        </p>
      )}
    </div>
  );
}
