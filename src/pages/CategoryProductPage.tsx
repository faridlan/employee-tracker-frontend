// pages/CategoryProductPage.tsx
import React, { useState } from "react";
import CategoryForm from "../components/CategoryForm";
import ProductForm from "../components/ProductForm";
import CategoryProductList from "../components/CategoryProductList";

const CategoryProductPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"category" | "product">("category");
  const [refresh, setRefresh] = useState(0);

  const refreshData = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Categories & Products</h1>

      {/* Tabs (T2) */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("category")}
          className={`px-4 py-2 rounded-lg border text-sm transition
            ${
              activeTab === "category"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          Category Form
        </button>
        <button
          onClick={() => setActiveTab("product")}
          className={`px-4 py-2 rounded-lg border text-sm transition
            ${
              activeTab === "product"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
            }`}
        >
          Product Form
        </button>
      </div>

      {/* Active Form */}
      <div className="grid md:grid-cols-2 gap-6">
        {activeTab === "category" ? (
          <CategoryForm onCreated={refreshData} />
        ) : (
          <ProductForm onCreated={refreshData} />
        )}
      </div>

      <hr className="border-gray-200" />

      {/* New Expandable List */}
      <div className="grid md:grid-cols-1 gap-6">
        <CategoryProductList refreshTrigger={refresh} />
      </div>
    </div>
  );
};

export default CategoryProductPage;
