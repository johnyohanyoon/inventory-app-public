import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { useCategories } from "@/hooks/useCategories";
import { useMsal } from "@azure/msal-react";
import ExcelService from "@/services/excelService";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { InventoryItem } from "@/types";
import { useInventoryItems } from "@/hooks/useInventoryItems";
import { MARKETPLACE_PLATFORMS } from "@/config/marketplaces";
import {
  Search,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Plus,
  X,
  Tag,
  Download,
  Upload,
  AlertCircle,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const InventoryManagement = () => {
  // HOOKS
  // Third-party hooks
  const { instance } = useMsal();
  const excelService = useMemo(() => new ExcelService(instance), [instance]);

  // Custom hooks
  const {
    items,
    filteredItems,
    searchTerm,
    addItem,
    updateItem,
    deleteItem,
    setSearchTerm,
  } = useInventoryItems();

  const {
    categories,
    newCategory,
    setNewCategory,
    addCategory,
    removeCategory,
  } = useCategories();

  // useState hooks
  const [syncStatus, setSyncStatus] = useState("idle");
  const [syncError, setSyncError] = useState(null);

  const [formData, setFormData] = useState<InventoryItem>({
    id: "",
    name: "",
    quantity: "",
    category: "",
    price: "",
    marketplaces: [],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [newMarketplace, setNewMarketplace] = useState({
    platform: "",
    listingPrice: "",
    url: "",
  });
  const [showCategoryManager, setShowCategoryManager] = useState(false);

  // useRef hooks
  const fileInputRef = useRef(null);

  // useEffect hooks
  useEffect(() => {
    const syncToExcel = async () => {
      if (!items.length) return;

      // Check if user is authenticated before attempting sync
      const accounts = instance.getAllAccounts();
      if (accounts.length === 0) {
        // No authenticated user - skip sync silently
        setSyncStatus("idle");
        return;
      }

      setSyncStatus("syncing");
      setSyncError(null);
      try {
        await excelService.syncInventoryData(items);
        setSyncStatus("success");
      } catch (error) {
        console.error("Failed to sync with Excel:", error);
        setSyncStatus("error");
        setSyncError(error.message);
      }
    };

    if (items.length > 0) {
      syncToExcel();
    }
  }, [items, excelService, instance]);

  // HANDLER FUNCTIONS
  // Fixes the error of exiting out before MS login
  const handleLogin = async () => {
    try {
      await instance.loginPopup();
      // Successfully logged in
    } catch (error) {
      if (error.errorCode === "user_cancelled") {
        // Handle if user exits popup
        console.log("Login cancelled");
      } else {
        // Handle other errors
        console.error("Login failed:", error);
      }
    }
  };

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (isEditing) {
        // ✅ Use updateItem from hook instead of setItems
        updateItem(formData);
        setIsEditing(false);
      } else {
        // ✅ Use addItem from hook instead of setItems
        addItem({ ...formData, id: Date.now().toString() });
      }
      setFormData({
        id: "",
        name: "",
        quantity: "",
        category: "",
        price: "",
        marketplaces: [],
      });
    },
    [isEditing, formData, addItem, updateItem],
  );

  const handleEdit = useCallback((item: InventoryItem) => {
    setFormData(item);
    setIsEditing(true);
  }, []);

  const handleDelete = useCallback(
    (id: string) => {
      // ✅ Use deleteItem from hook instead of setItems
      deleteItem(id);
    },
    [deleteItem],
  );

  const addMarketplace = useCallback(() => {
    if (newMarketplace.platform && newMarketplace.listingPrice) {
      setFormData({
        ...formData,
        marketplaces: [...formData.marketplaces, newMarketplace],
      });
      setNewMarketplace({ platform: "", listingPrice: "", url: "" });
    }
  }, [formData, newMarketplace]);

  const removeMarketplace = useCallback(
    (index: number) => {
      setFormData({
        ...formData,
        marketplaces: formData.marketplaces.filter((_, i) => i !== index),
      });
    },
    [formData],
  );

  // ✅ filteredItems now comes from useInventoryItems hook - removed duplicate

  const handleRemoveCategory = (categoryToRemove: string) => {
    removeCategory(categoryToRemove); // from hook
    items.forEach((item) => {
      if (item.category === categoryToRemove) {
        updateItem({ ...item, category: "Other" });
      }
    });
  };

  const exportToCSV = () => {
    // Prepare data for export
    const exportData = items.map((item) => ({
      Name: item.name,
      Quantity: item.quantity,
      Category: item.category,
      "Cost Price": item.price,
      "Marketplace Listings": item.marketplaces
        .map(
          (m) =>
            `${m.platform}: $${m.listingPrice}${m.url ? ` (${m.url})` : ""}`,
        )
        .join("; "),
    }));

    // Convert to CSV
    const csv = Papa.unparse(exportData);

    // Create and trigger download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "inventory_export.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const exportData = items.map((item) => ({
      Name: item.name,
      Quantity: item.quantity,
      Category: item.category,
      "Cost Price": item.price,
      "Marketplace Listings": item.marketplaces
        .map(
          (m) =>
            `${m.platform}: $${m.listingPrice}${m.url ? ` (${m.url})` : ""}`,
        )
        .join("; "),
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Inventory");
    XLSX.writeFile(wb, "inventory_export.xlsx");
  };

  const processImportedData = (data: any[]) => {
    // ✅ Use addItem from hook for each imported item
    data.forEach((row) => {
      let marketplaces = [];
      if (row["Marketplace Listings"]) {
        marketplaces = row["Marketplace Listings"]
          .split(";")
          .map((listing: string) => {
            const [platformPrice, url] = listing.split("(");
            const [platform, price] = platformPrice.split(":");
            return {
              platform: platform.trim(),
              listingPrice: price ? price.replace("$", "").trim() : "",
              url: url ? url.replace(")", "").trim() : "",
            };
          });
      }

      const newItem: InventoryItem = {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
        name: row.Name || row.name || "",
        quantity: row.Quantity || row.quantity || 0,
        category: row.Category || row.category || "Other",
        price: row["Cost Price"] || row.price || 0,
        marketplaces: marketplaces,
      };

      addItem(newItem);
    });
  };

  const handleFileUpload = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.name.split(".").pop()?.toLowerCase();

    if (fileType === "csv") {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          processImportedData(results.data);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          alert("Error parsing CSV file");
        },
      });
    } else if (["xlsx", "xls"].includes(fileType || "")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as ArrayBuffer;
        const data = new Uint8Array(result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        processImportedData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    } else {
      alert("Please upload a CSV or Excel file");
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <Card className="bg-white dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span className="text-gray-900 dark:text-white">
                Inventory Management
              </span>
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".csv,.xlsx,.xls"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 dark:text-gray-200 dark:border-gray-600"
                  onClick={() => fileInputRef.current.click()}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 dark:text-gray-200 dark:border-gray-600"
                  onClick={exportToCSV}
                >
                  <Download size={14} />
                  CSV
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-gray-900 dark:text-gray-200 dark:border-gray-600"
                  onClick={exportToExcel}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Excel
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Sync Status */}
            <div className="flex items-center gap-4 mb-4">
              <Button
                className="text-gray-900 dark:text-gray-200 dark:border-gray-600"
                onClick={handleLogin}
                variant={syncStatus === "syncing" ? "secondary" : "outline"}
                disabled={syncStatus === "syncing"}
              >
                {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
              </Button>
              {syncError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Sync Error</AlertTitle>
                  <AlertDescription>{syncError}</AlertDescription>
                </Alert>
              )}
            </div>
            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-2 text-gray-400"
                size={20}
              />
              <Input
                type="text"
                placeholder="Search items..."
                className="pl-10 text-base placeholder:text-base text-gray-900 dark:text-gray-400 dark:border-gray-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Category Manager Button */}
        <Button
          onClick={() => setShowCategoryManager(!showCategoryManager)}
          className="mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg flex items-center gap-2 hover:bg-gray-600"
        >
          <Tag size={20} />
          {showCategoryManager ? "Hide" : "Manage"} Categories
        </Button>

        {/* Category Manager */}
        {showCategoryManager && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Manage Categories</h3>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New category name"
                className="p-2 border rounded flex-grow"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
              />
              <Button
                onClick={addCategory}
                className="px-4 py-2 bg-green-500 text-white rounded-lg flex items-center gap-2 hover:bg-green-600"
              >
                <Plus size={20} />
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <div
                  key={category}
                  className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border"
                >
                  {category}
                  {category !== "Other" && (
                    <Button
                      onClick={() => handleRemoveCategory(category)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Inventory Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-800">
                <th className="p-4 text-left text-white">Name</th>
                <th className="p-4 text-left text-white">Quantity</th>
                <th className="p-4 text-left text-white">Category</th>
                <th className="p-4 text-left text-white">Cost Price</th>
                <th className="p-4 text-left text-white">
                  Marketplace Listings
                </th>
                <th className="p-4 text-left text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 text-gray-900 dark:text-white">
                    {item.name}
                  </td>
                  <td className="p-4 text-gray-900 dark:text-white">
                    {item.quantity}
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-gray-900 dark:text-white">
                    ${Number(item.price).toFixed(2)}
                  </td>
                  <td className="p-4">
                    {item.marketplaces?.length > 0 ? (
                      <div className="flex flex-col gap-1">
                        {item.marketplaces.map((listing, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm"
                          >
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                              {listing.platform}
                            </span>
                            <span className="text-gray-900 dark:text-white">
                              ${Number(listing.listingPrice).toFixed(2)}
                            </span>
                            {listing.url && (
                              <a
                                href={listing.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink size={14} />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Not listed</span>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleEdit(item)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded"
                      >
                        <Edit2 size={20} />
                      </Button>
                      <Button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded"
                      >
                        <Trash2 size={20} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add/Edit Form */}
        <form
          onSubmit={handleSubmit}
          className="mb-8 p-6 bg-gray-50 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Item name"
              className="p-2 border rounded"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Quantity"
              className="p-2 border rounded"
              value={formData.quantity}
              onChange={(e) =>
                setFormData({ ...formData, quantity: e.target.value })
              }
              required
              min="0"
            />
            <select
              className="p-2 border rounded"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                placeholder="Cost Price"
                className="p-2 border rounded pl-7"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                step="0.01"
                min="0"
              />
            </div>
          </div>

          {/* Marketplace Listings Section */}
          <div className="mt-4 p-4 border rounded-lg bg-white">
            <h3 className="font-semibold mb-2">Marketplace Listings</h3>

            {/* Add New Marketplace Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
              <select
                value={newMarketplace.platform}
                onChange={(e) =>
                  setNewMarketplace({
                    ...newMarketplace,
                    platform: e.target.value,
                  })
                }
                className="p-2 border rounded"
              >
                <option value="">Select Platform</option>
                {MARKETPLACE_PLATFORMS.map((platform) => (
                  <option key={platform.id} value={platform.name}>
                    {platform.name}
                  </option>
                ))}
              </select>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  placeholder="Listing Price"
                  value={newMarketplace.listingPrice}
                  onChange={(e) =>
                    setNewMarketplace({
                      ...newMarketplace,
                      listingPrice: e.target.value,
                    })
                  }
                  className="p-2 border rounded pl-7"
                  step="0.01"
                  min="0"
                />
              </div>
              <input
                type="url"
                placeholder="Listing URL (optional)"
                value={newMarketplace.url}
                onChange={(e) =>
                  setNewMarketplace({ ...newMarketplace, url: e.target.value })
                }
                className="p-2 border rounded"
              />
            </div>
            <Button
              type="button"
              onClick={addMarketplace}
              className="px-3 py-1 bg-green-500 text-white rounded-lg flex items-center gap-1 text-sm hover:bg-green-600"
            >
              <Plus size={16} />
              Add Listing
            </Button>

            {/* Current Marketplace Listings */}
            {formData.marketplaces.length > 0 && (
              <div className="mt-2">
                {formData.marketplaces.map((listing, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-gray-50 p-2 rounded mt-1"
                  >
                    <span className="font-medium">{listing.platform}</span>
                    <span>${Number(listing.listingPrice).toFixed(2)}</span>
                    {listing.url && (
                      <a
                        href={listing.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        <ExternalLink size={16} />
                      </a>
                    )}
                    <Button
                      type="button"
                      onClick={() => removeMarketplace(index)}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      <X size={16} />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <PlusCircle size={20} />
            {isEditing ? "Update Item" : "Add Item"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default InventoryManagement;
