import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import SchoolRequestModal from "@/components/dashboard/SchoolRequestModal";
import useSchoolStore from "@/store/schoolStore";
import { useWarehouse } from "@/context/WarehouseContext";
import apiClient from "@/lib/apiClient";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  GraduationCap,
  Package,
  ArrowUpRight,
  ArrowRight,
  ChevronRight,
  Plus,
  Loader2,
} from "lucide-react";

const statusLabelMap = {
  initialized: "New",
  processed: "Processed",
  shipped: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
  refunded: "Refunded",
};

const statusBadgeVariant = {
  initialized: "initialized",
  processed: "processing",
  shipped: "shipped",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
  cancelled: "cancelled",
  refunded: "refunded",
};

export default function Overview() {
  const { activeWarehouse } = useWarehouse();
  const { openRequestModal } = useSchoolStore();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await apiClient.get("/retailer/dashboard/overview");
        setData(res.data?.data || null);
      } catch (err) {
        console.error("Failed to fetch dashboard overview:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchOverview();
  }, []);

  const handleRequestSchoolAccess = () => {
    const city = activeWarehouse?.address?.city || activeWarehouse?.city || "";
    openRequestModal(city);
  };

  // Build stat cards from API data
  const statCards = [
    {
      title: "Total Sales",
      value: data
        ? `₹${data.totalSales >= 1000 ? `${(data.totalSales / 1000).toFixed(1)}K` : data.totalSales.toFixed(0)}`
        : "—",
      change: null,
      changeType: "positive",
      icon: TrendingUp,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      link: null,
    },
    {
      title: "Active Orders",
      value: data ? data.activeOrders.toString() : "—",
      change: null,
      changeType: "positive",
      icon: ShoppingCart,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      link: "/dashboard/orders",
    },
    {
      title: "Low Stock Alerts",
      value: data ? data.lowStockVariants.toString() : "—",
      change: data?.lowStockVariants > 0 ? "Need attention" : "All good",
      changeType: data?.lowStockVariants > 0 ? "warning" : "positive",
      icon: AlertTriangle,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      link: "/dashboard/inventory/health",
    },
    {
      title: "Active Schools",
      value: data ? data.activeSchools.toString() : "—",
      change: data ? `${data.pendingSchools} pending` : null,
      changeType: "neutral",
      icon: GraduationCap,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      link: "/dashboard/inventory/schools",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Welcome back 👋</h1>
          <p className="mt-1 text-sm text-slate-500">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/dashboard/inventory/general/add">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4" />
              Add Product
            </Button>
          </Link>
          <Button size="sm" onClick={handleRequestSchoolAccess}>
            <Plus className="h-4 w-4" />
            Request School Access
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat, index) => {
          const content = (
            <div
              className={`rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md ${stat.link ? "cursor-pointer hover:border-blue-200" : ""
                }`}
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900">
                    {loading ? (
                      <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-200" />
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p
                    className={`flex items-center gap-1 text-sm ${!stat.change
                      ? "invisible"
                      : stat.changeType === "positive"
                        ? "text-emerald-600"
                        : stat.changeType === "warning"
                          ? "text-amber-600"
                          : "text-slate-500"
                      }`}
                  >
                    {stat.changeType === "positive" && (
                      <ArrowUpRight className="h-4 w-4" />
                    )}
                    {stat.change || "—"}
                  </p>
                </div>
                <div className={`rounded-lg p-3 ${stat.iconBg}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </div>
          );

          return stat.link ? (
            <Link key={index} to={stat.link}>
              {content}
            </Link>
          ) : (
            <div key={index}>{content}</div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Orders (now takes full width since Action Center used mock data) */}
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent Orders
              </h2>
              <Link
                to="/dashboard/orders"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View all <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100 p-4">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  <span className="ml-2 text-sm text-slate-500">
                    Loading orders...
                  </span>
                </div>
              ) : data?.recentOrders?.length > 0 ? (
                data.recentOrders.map((order) => {
                  console.log("Recent order:", order);
                  return (
                    <Link
                      key={order.id}
                      to={`/dashboard/orders/${order.items?.[0]?.id || order.id}`}
                      className="flex items-center gap-3 rounded-lg p-3 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <Package className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {order.items?.length > 0
                            ? order.items.map(i => i.schoolName ? `${i.title} - ${i.schoolName}` : i.title).join(', ')
                            : (order.orderNumber || order.id)}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>
                            ₹{parseFloat(order.items?.[0].price || 0).toLocaleString()}
                          </span>
                          <span>·</span>
                          <span>
                            {order.items?.length} item
                            {order.items?.length !== 1 ? "s" : ""}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={statusBadgeVariant[order.status] || order.status}
                        dot
                        className="flex-shrink-0 text-xs"
                      >
                        {statusLabelMap[order.status] || order.status}
                      </Badge>
                    </Link>
                  )
                })
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  No orders yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Add School Product",
            href: "/dashboard/inventory/schools",
            icon: GraduationCap,
            bgColor: "bg-violet-100",
            iconColor: "text-violet-600",
          },
          {
            label: "Add General Product",
            href: "/dashboard/inventory/general",
            icon: Package,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
          },
          {
            label: "View All Orders",
            href: "/dashboard/orders",
            icon: ShoppingCart,
            bgColor: "bg-emerald-100",
            iconColor: "text-emerald-600",
          },
          {
            label: "Update Profile",
            href: "/dashboard/settings/profile",
            icon: TrendingUp,
            bgColor: "bg-amber-100",
            iconColor: "text-amber-600",
          },
        ].map((action, index) => (
          <Link key={index} to={action.href}>
            <div className="flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
              <div className={`rounded-lg p-3 ${action.bgColor}`}>
                <action.icon className={`h-5 w-5 ${action.iconColor}`} />
              </div>
              <span className="flex-1 font-medium text-slate-900">
                {action.label}
              </span>
              <ArrowRight className="h-4 w-4 text-slate-400" />
            </div>
          </Link>
        ))}
      </div>

      {/* School Request Modal (powered by schoolStore + warehouse city) */}
      <SchoolRequestModal />
    </div>
  );
}
