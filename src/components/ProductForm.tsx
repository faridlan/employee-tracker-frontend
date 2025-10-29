import React, { useEffect, useState } from "react";
import { getAllCategories } from "../services/categoryService";
import { createProduct } from "../services/productService";
import type { Category } from "../types/product";

interface Props {
  onCreated: () => void;
}

const ProductForm: React.FC<Props> = ({ onCreated }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await createProduct({ name, category_id: categoryId });
      setSuccess(true);
      setName("");
      setCategoryId("");
      onCreated();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">Product added successfully!</p>}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Product"}
      </button>
    </form>
  );
};

export default ProductForm;
