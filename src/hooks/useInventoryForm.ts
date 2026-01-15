import { useState, useCallback } from "react";
import { InventoryItem } from "@/types";

export const useInventoryForm = () => {
  // STATE
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

  // ACTIONS
  const handleAddMarketplace = useCallback(() => {
    if (newMarketplace.platform && newMarketplace.listingPrice) {
      setFormData((prev) => ({
        // changed to use functional update to prevent stale closure issues
        ...prev,
        marketplaces: [...prev.marketplaces, newMarketplace],
      }));
      setNewMarketplace({ platform: "", listingPrice: "", url: "" });
    }
  }, [newMarketplace]);

  const handleRemoveMarketplace = useCallback(
    (index: number) => {
      setFormData({
        ...formData,
        marketplaces: formData.marketplaces.filter((_, i) => i !== index),
      });
    },
    [formData],
  );

  const resetForm = useCallback(() => {
    setFormData({
      id: "",
      name: "",
      quantity: "",
      category: "",
      price: "",
      marketplaces: [],
    });
    setIsEditing(false);
  }, []);

  const setEditMode = useCallback((item: InventoryItem) => {
    setFormData(item);
    setIsEditing(true);
  }, []);

  // RETURN
  return {
    // State
    formData,
    isEditing,
    newMarketplace,

    // Setters: EXPOSE setters for form fields (controlled inputs)
    setFormData,
    setNewMarketplace,

    // Actions: EXPOSE action functions (complex operations)
    handleAddMarketplace,
    handleRemoveMarketplace,
    resetForm,
    setEditMode,
  };
};
