import React from "react";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import InventoryManagement from "@/InventoryManagement";

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Inventory Management App
            </h1>
            <ThemeToggle />
          </div>
          <InventoryManagement />
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;
