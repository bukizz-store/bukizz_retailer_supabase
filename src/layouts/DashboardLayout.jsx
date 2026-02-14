import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import useAuthStore from "@/store/authStore";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  GraduationCap,
  Settings,
  HelpCircle,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  LogOut,
  User,
  Store,
} from "lucide-react";
import WarehouseSwitcher from "@/components/dashboard/WarehouseSwitcher";

const navItems = [
  {
    label: "Overview",
    href: "/dashboard/overview",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Inventory",
    href: "/dashboard/inventory",
    icon: <Package className="h-5 w-5" />,
    subItems: [
      {
        label: "General Store",
        href: "/dashboard/inventory/general",
        icon: <Store className="h-4 w-4" />,
      },
      {
        label: "Inventory Health",
        href: "/dashboard/inventory/health",
        icon: <TrendingUp className="h-4 w-4" />,
      },
      {
        label: "My Schools",
        href: "/dashboard/inventory/schools",
        icon: <GraduationCap className="h-4 w-4" />,
      },
    ],
  },
  {
    label: "Orders",
    href: "/dashboard/orders",
    icon: <ShoppingCart className="h-5 w-5" />,
    badge: 3,
    subItems: [
      { label: "Active Orders", href: "/dashboard/orders" },
      { label: "Cancelled", href: "/dashboard/orders/cancelled" },
      { label: "Returns", href: "/dashboard/orders/returns" },
    ],
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-5 w-5" />,
  },
];

function NavItem({ item, pathname }) {
  const [isOpen, setIsOpen] = useState(false);
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const hasSubItems = item.subItems && item.subItems.length > 0;

  React.useEffect(() => {
    if (hasSubItems && isActive) {
      setIsOpen(true);
    }
  }, []);

  if (hasSubItems) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive
              ? "bg-blue-50 text-blue-700"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <span className={cn(isActive ? "text-blue-600" : "text-slate-400")}>
            {item.icon}
          </span>
          <span className="flex-1 text-left">{item.label}</span>
          {item.badge && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {item.badge}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180",
            )}
          />
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1 border-l-2 border-slate-200 pl-4">
            {item.subItems.map((subItem) => {
              const isSubActive = pathname === subItem.href;
              return (
                <Link
                  key={subItem.href}
                  to={subItem.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors",
                    isSubActive
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700",
                  )}
                >
                  {subItem.icon && (
                    <span
                      className={cn(
                        isSubActive ? "text-blue-600" : "text-slate-400",
                      )}
                    >
                      {subItem.icon}
                    </span>
                  )}
                  {subItem.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <Link
      to={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-blue-50 text-blue-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <span className={cn(isActive ? "text-blue-600" : "text-slate-400")}>
        {item.icon}
      </span>
      {item.label}
    </Link>
  );
}

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  // Derive initials and display name from the user object
  const displayName = user?.full_name || "User";
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-white border-r border-slate-200 shadow-sm transition-transform duration-300 ease-in-out overflow-visible",
          "lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 font-bold text-white text-lg">
            B
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Bukizz</h1>
            <p className="text-xs text-slate-500">Vendor Portal</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navItems.map((item) => (
            <NavItem key={item.href} item={item} pathname={pathname} />
          ))}
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500">
                {user?.email || ""}
              </p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-slate-200 bg-white px-4 shadow-sm lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Search */}
          <div className="relative hidden flex-1 md:flex">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search products, orders, schools..."
              className="h-10 w-full max-w-md rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <WarehouseSwitcher />
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <HelpCircle className="h-5 w-5" />
            </button>
            <button className="relative rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
            <div className="hidden sm:flex items-center gap-2 ml-2 rounded-lg border border-slate-200 px-3 py-1.5">
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-xs font-bold text-white">
                {initials}
              </div>
              <span className="text-sm font-medium text-slate-700">
                {displayName.split(" ")[0]}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
