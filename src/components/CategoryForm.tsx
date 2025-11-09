import React, { useState } from "react";
import { createCategory } from "../services/categoryService";

interface Props {
  onCreated: () => void;
}

const CategoryForm: React.FC<Props> = ({ onCreated }) => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      await createCategory({ name });
      setSuccess(true);
      setName("");
      onCreated();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create category");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Category</h2>
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">Category added successfully!</p>}

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

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-[#005BAA] text-white rounded-lg hover:bg-[#0668C2] disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Category"}
      </button>
    </form>
  );
};

export default CategoryForm;
