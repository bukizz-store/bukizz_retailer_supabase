import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useWarehouse } from "@/context/WarehouseContext";
import { ChevronDown, Store, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WarehouseSwitcher() {
  const navigate = useNavigate();
  const { warehouses, activeWarehouse, loading, switchWarehouse } =
    useWarehouse();
  const [isOpen, setIsOpen] = useState(false);

  if (loading)
    return <div className="h-9 w-32 bg-slate-100 animate-pulse rounded-lg" />;

  if (warehouses.length === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <div className="flex h-6 w-6 items-center justify-center rounded bg-orange-100 text-orange-600">
          <Store className="h-4 w-4" />
        </div>
        <span className="max-w-[150px] truncate">
          {activeWarehouse ? activeWarehouse.name : "Select Warehouse"}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-slate-400 transition-transform",
            isOpen && "rotate-180",
          )}
        />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-lg border border-slate-200 bg-white shadow-lg p-1">
            <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Switch Warehouse
            </div>
            {warehouses.map((warehouse) => (
              <button
                key={warehouse.id}
                onClick={() => {
                  setIsOpen(false);
                  switchWarehouse(warehouse);
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-left transition-colors",
                  activeWarehouse?.id === warehouse.id
                    ? "bg-orange-50 text-orange-700"
                    : "text-slate-700 hover:bg-slate-50",
                )}
              >
                <span
                  className={cn(
                    "flex h-2 w-2 rounded-full",
                    activeWarehouse?.id === warehouse.id
                      ? "bg-orange-500"
                      : "bg-transparent",
                  )}
                />
                {warehouse.name}
              </button>
            ))}
            <div className="my-1 border-t border-slate-100" />
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/dashboard/settings/warehouses");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm text-left text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <Settings className="h-3.5 w-3.5" />
              Manage Warehouses
            </button>
          </div>
        </>
      )}
    </div>
  );
}
