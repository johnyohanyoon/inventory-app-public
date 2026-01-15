import { useState, useEffect, useCallback } from "react";

/**
 * Custom hook for managing inventory categories
 * Handles: Category CRUD, localStorage persistence, "Other" category logic
 */

export const useCategories = () => {
  // State: List of categories
  const [categories, setCategories] = useState([
    "Electronics",
    "Clothing",
    "Books",
    "Home & Garden",
    "Toys",
    "Sports Equipment",
    "Other", // 'Other' will always be last
  ]);

  // State: New category input
  const [newCategory, setNewCategory] = useState("");

  // Effect: Load categories from localStorage (items are handled by useInventoryItems hook)
  useEffect(() => {
    const savedCategories = localStorage.getItem("inventoryCategories");
    if (savedCategories) {
      // Ensure 'Other' is always at the end when loading saved categories
      const loadedCategories = JSON.parse(savedCategories);
      const categoriesWithoutOther = loadedCategories.filter(
        (cat: string) => cat !== "Other",
      );
      setCategories([...categoriesWithoutOther, "Other"]);
    }
  }, []);

  // Effect: Save categories to localStorage
  useEffect(() => {
    localStorage.setItem("inventoryCategories", JSON.stringify(categories));
  }, [categories]);

  // Function: Add a new category
  const addCategory = useCallback(() => {
    if (newCategory && !categories.includes(newCategory)) {
      const categoriesWithoutOther = categories.filter(
        (cat) => cat !== "Other",
      );
      setCategories([...categoriesWithoutOther, newCategory, "Other"]);
      setNewCategory("");
    }
  }, [categories, newCategory]);

  // Function: Remove a category
  // Note: ONLY removes from categories list
  // Component will handle updating items
  const removeCategory = useCallback(
    (categoryToRemove: string) => {
      setCategories(categories.filter((cat) => cat !== categoryToRemove));
    },
    [categories],
  );

  return {
    categories,
    newCategory,
    setNewCategory,
    addCategory,
    removeCategory,
  };
};
