import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { warehouseService } from "@/services/warehouseService";

const WarehouseContext = createContext(null);

export function WarehouseProvider({ children }) {
  const [warehouses, setWarehouses] = useState([]);
  const [activeWarehouse, setActiveWarehouse] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchWarehouses = useCallback(async () => {
    setLoading(true);
    try {
      const data = await warehouseService.getWarehouses();
      setWarehouses(data);

      const storedId = localStorage.getItem("activeWarehouseId");
      if (storedId) {
        const found = data.find((w) => w.id === storedId);
        if (found) {
          setActiveWarehouse(found);
        } else if (data.length > 0) {
          setActiveWarehouse(data[0]);
          localStorage.setItem("activeWarehouseId", data[0].id);
        }
      } else if (data.length > 0) {
        setActiveWarehouse(data[0]);
        localStorage.setItem("activeWarehouseId", data[0].id);
      }
    } catch (error) {
      console.error("Failed to fetch warehouses:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  const switchWarehouse = useCallback((warehouse) => {
    setActiveWarehouse(warehouse);
    localStorage.setItem("activeWarehouseId", warehouse.id);
    // Reload to refresh data with new warehouse header
    window.location.reload();
  }, []);

  return (
    <WarehouseContext.Provider
      value={{
        warehouses,
        activeWarehouse,
        loading,
        switchWarehouse,
        refreshWarehouses: fetchWarehouses,
      }}
    >
      {children}
    </WarehouseContext.Provider>
  );
}

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error("useWarehouse must be used within a WarehouseProvider");
  }
  return context;
}
