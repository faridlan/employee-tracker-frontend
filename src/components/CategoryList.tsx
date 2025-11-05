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

      {categories.map((cat) => {
        const count = cat.products?.length ?? 0;
        return (
          <div key={cat.id} className="mb-4 border-b pb-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                {cat.name}{" "}
                <span className="text-sm text-gray-500">({count})</span>
              </h3>
            </div>

            {count > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {cat.products!.map((p) => (
                  <span
                    key={p.id}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded-full text-xs sm:text-sm"
                  >
                    {p.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm mt-2">No products</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default CategoryList;
