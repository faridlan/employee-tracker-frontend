import React, { useEffect, useState } from "react";
import type { Product } from "../types/product";
import { getAllProducts } from "../services/productService";

interface Props {
  refreshTrigger: number;
}

const ProductList: React.FC<Props> = ({ refreshTrigger }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [refreshTrigger]);

  if (loading) return <p>Loading products...</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Product List</h2>
      <ul>
        {products.map((p) => (
          <li key={p.id} className="border-b py-2">
            <span className="font-medium">{p.name}</span>{" "}
            <span className="text-gray-500 text-sm">
              ({p.category?.name ?? "No Category"})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductList;
