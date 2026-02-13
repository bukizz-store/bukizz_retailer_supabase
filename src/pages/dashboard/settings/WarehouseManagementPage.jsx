import React, { useState, useEffect } from "react";
import { warehouseService } from "@/services/warehouseService";
import { useWarehouse } from "@/context/WarehouseContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Store,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";

const INITIAL_FORM = {
  name: "",
  contactPhone: "",
  contactEmail: "",
  website: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  },
};

const WarehouseManagementPage = () => {
  const { warehouses, loading, refreshWarehouses } = useWarehouse();
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const handleOpenModal = (warehouse = null) => {
    setEditingWarehouse(warehouse);
    if (warehouse) {
      setFormData({
        name: warehouse.name || "",
        contactPhone: warehouse.contact_phone || "",
        contactEmail: warehouse.contact_email || "",
        website: warehouse.website || "",
        address: {
          line1: warehouse.address?.line1 || "",
          line2: warehouse.address?.line2 || "",
          city: warehouse.address?.city || "",
          state: warehouse.address?.state || "",
          postalCode: warehouse.address?.postalCode || "",
          country: warehouse.address?.country || "India",
        },
      });
    } else {
      setFormData(INITIAL_FORM);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingWarehouse(null);
    setFormData(INITIAL_FORM);
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateAddress = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [field]: value },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSubmitting(true);
    try {
      if (editingWarehouse) {
        await warehouseService.updateWarehouse(editingWarehouse.id, formData);
        toast({ title: "Warehouse updated successfully", variant: "success" });
      } else {
        await warehouseService.createWarehouse(formData);
        toast({ title: "Warehouse created successfully", variant: "success" });
      }
      refreshWarehouses();
      handleCloseModal();
    } catch (error) {
      console.error(error);
      toast({
        title: editingWarehouse
          ? "Failed to update warehouse"
          : "Failed to create warehouse",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this warehouse?"))
      return;

    try {
      await warehouseService.deleteWarehouse(id);
      toast({ title: "Warehouse deleted successfully", variant: "success" });
      refreshWarehouses();
    } catch (error) {
      console.error(error);
      toast({
        title: "Failed to delete warehouse",
        description: error?.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Warehouse Management
          </h1>
          <p className="text-sm text-slate-500">
            Manage your warehouse locations and settings.
          </p>
        </div>
        <Button
          onClick={() => handleOpenModal()}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Warehouse
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Contact</th>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-8 text-center text-slate-500"
                  >
                    Loading warehouses...
                  </td>
                </tr>
              ) : warehouses.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-6 py-12 text-center text-slate-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Store className="h-6 w-6" />
                      </div>
                      <p className="font-medium text-slate-900">
                        No warehouses found
                      </p>
                      <p className="text-xs">
                        Add your first warehouse to get started.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {warehouse.name}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div>{warehouse.contact_email}</div>
                      <div>{warehouse.contact_phone}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                      {warehouse.id}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(warehouse)}
                        >
                          <Pencil className="h-4 w-4 text-slate-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(warehouse.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-xl shadow-lg overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 shrink-0">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingWarehouse ? "Edit Warehouse" : "Add Warehouse"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form
              onSubmit={handleSubmit}
              className="flex flex-col flex-1 overflow-hidden"
            >
              <div className="p-6 space-y-5 overflow-y-auto flex-1">
                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Warehouse Name"
                    placeholder="Ex. North Zone Depot"
                    value={formData.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    required
                    autoFocus
                  />
                  <Input
                    label="Contact Phone"
                    placeholder="+91..."
                    value={formData.contactPhone}
                    onChange={(e) =>
                      updateField("contactPhone", e.target.value)
                    }
                    icon={<Phone className="h-4 w-4" />}
                  />
                </div>

                {/* Row 2: Email */}
                <Input
                  label="Contact Email"
                  type="email"
                  placeholder="warehouse@example.com"
                  value={formData.contactEmail}
                  onChange={(e) => updateField("contactEmail", e.target.value)}
                  icon={<Mail className="h-4 w-4" />}
                />

                {/* Address Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm font-semibold">
                      Location Address
                    </span>
                  </div>

                  <Input
                    label="Address Line 1"
                    placeholder="Street address, building, floor..."
                    value={formData.address.line1}
                    onChange={(e) => updateAddress("line1", e.target.value)}
                  />

                  <Input
                    label="Address Line 2"
                    placeholder="Landmark, suite, unit, etc. (Optional)"
                    value={formData.address.line2}
                    onChange={(e) => updateAddress("line2", e.target.value)}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="City"
                      placeholder="Ex. Mumbai"
                      value={formData.address.city}
                      onChange={(e) => updateAddress("city", e.target.value)}
                    />
                    <Input
                      label="State"
                      placeholder="Ex. Maharashtra"
                      value={formData.address.state}
                      onChange={(e) => updateAddress("state", e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Postal Code"
                      placeholder="Ex. 400001"
                      value={formData.address.postalCode}
                      onChange={(e) =>
                        updateAddress("postalCode", e.target.value)
                      }
                    />
                    <Input
                      label="Country"
                      placeholder="India"
                      value={formData.address.country}
                      onChange={(e) => updateAddress("country", e.target.value)}
                    />
                  </div>
                </div>

                {/* Website */}
                <Input
                  label="Website"
                  type="url"
                  placeholder="https://warehouse-logistics.com"
                  value={formData.website}
                  onChange={(e) => updateField("website", e.target.value)}
                  icon={<Globe className="h-4 w-4" />}
                />
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                  loading={submitting}
                >
                  {editingWarehouse ? "Save Changes" : "Create Warehouse"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehouseManagementPage;
