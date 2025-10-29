import React, { useEffect, useState } from "react";
import type { Category } from "../types/product";
import { getAllCategories } from "../services/categoryService";

interface Props {
  refreshTrigger: number;
}

const CategoryList: React.FC<Props> = ({ refreshTrigger }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllCategories();
        setCategories(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [refreshTrigger]);

  if (loading) return <p>Loading categories...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Categories & Products</h2>
      {categories.map((cat) => (
        <div key={cat.id} className="mb-4 border-b pb-3">
          <h3 className="font-semibold">{cat.name}</h3>
          {cat.products && cat.products.length > 0 ? (
            <ul className="list-disc ml-6 text-gray-600">
              {cat.products.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm ml-6">No products</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default CategoryList;
