import { useState, useEffect, useCallback } from "react";
import { InventoryItem } from "@/types";

/**
 * Custom hook for managing inventory items
 * Handles: CRUD operations, localStorage persistence, search filtering
 */
export const useInventoryItems = () => {
  // State: List of all inventory items
  const [items, setItems] = useState<InventoryItem[]>([]);

  // State: Search term for filtering
  const [searchTerm, setSearchTerm] = useState("");

  // Effect: Load items from localStorage when component mounts
  useEffect(() => {
    const savedItems = localStorage.getItem("inventoryItems");
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    }
  }, []); // Empty array = run once on mount

  // Effect: Save items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("inventoryItems", JSON.stringify(items));
  }, [items]); // Run whenever 'items' changes

  // Function: Add a new item
  const addItem = useCallback((item: InventoryItem) => {
    setItems((prevItems) => [...prevItems, item]);
  }, []);

  // Function: Update an existing item
  const updateItem = useCallback((updatedItem: InventoryItem) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  }, []);

  // Function: Delete an item by ID
  const deleteItem = useCallback((id: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== id));
  }, []);

  // Computed: Filtered items based on search term
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Return everything the component needs
  return {
    // Data
    items,
    filteredItems,
    searchTerm,

    // Actions
    addItem,
    updateItem,
    deleteItem,
    setSearchTerm,
  };
};
