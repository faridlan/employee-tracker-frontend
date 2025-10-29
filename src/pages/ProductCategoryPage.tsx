import React, { useState } from "react";
import CategoryForm from "../components/CategoryForm";
import ProductForm from "../components/ProductForm";
import CategoryList from "../components/CategoryList";
import ProductList from "../components/ProductList";

const ProductCategoryPage: React.FC = () => {
  const [refresh, setRefresh] = useState(0);

  const refreshData = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Categories & Products</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <CategoryForm onCreated={refreshData} />
        <ProductForm onCreated={refreshData} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <CategoryList refreshTrigger={refresh} />
        <ProductList refreshTrigger={refresh} />
      </div>
    </div>
  );
};

export default ProductCategoryPage;
