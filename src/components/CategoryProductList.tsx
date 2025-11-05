// components/CategoryProductList.tsx
import React, { useEffect, useState } from "react";
import type { Category } from "../types/product";
import {
  getAllCategories,
  updateCategory,
  deleteCategory,
} from "../services/categoryService";
import { updateProduct, deleteProduct } from "../services/productService";
import { ChevronDown, ChevronRight, Edit3, Save, X, Trash2 } from "lucide-react";
import { useToast } from "./ToastProvider";

interface Props {
  refreshTrigger: number;
}

interface ConfirmOptions {
  title: string;
  message: string;
  action: () => Promise<void>;
}

const CategoryProductList: React.FC<Props> = ({ refreshTrigger }) => {
  const { showToast } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductName, setEditProductName] = useState("");
  const [editProductCategoryId, setEditProductCategoryId] = useState("");

  const [confirm, setConfirm] = useState<ConfirmOptions | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllCategories();
      setCategories(data);
      setAllCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [refreshTrigger]);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const productsSorted = (cat: Category) =>
    [...(cat.products ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name, "id-ID")
    );

  // Save Category
  const saveCategory = async () => {
    if (!editingCategoryId) return;
    try {
      const trimmed = editCategoryName.trim();
      if (!trimmed) throw new Error("Name is required");

      await updateCategory(editingCategoryId, { name: trimmed });
      showToast("Category updated successfully ✅", "success");

      setEditingCategoryId(null);
      setEditCategoryName("");
      void refresh();
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Failed to update category ❌",
        "error"
      );
    }
  };

  // Save Product
  const saveProduct = async () => {
    if (!editingProductId) return;
    try {
      const nameTrim = editProductName.trim();
      if (!nameTrim) throw new Error("Product name is required");

      await updateProduct(editingProductId, {
        name: nameTrim,
        category_id: editProductCategoryId,
      });

      showToast("Product updated successfully ✅", "success");

      setEditingProductId(null);
      setEditProductName("");
      setEditProductCategoryId("");
      void refresh();
    } catch {
      showToast(
        "Failed to update product (maybe linked to targets) ❌",
        "error"
      );
    }
  };

  // Delete with Confirm
  const askConfirm = (options: ConfirmOptions) => setConfirm(options);

  const doConfirm = async () => {
    if (!confirm) return;
    const { action } = confirm;
    setConfirm(null);
    await action();
  };

const deleteCategorySafe = async (id: string) => {
  try {
    const res = await deleteCategory(id);

    showToast("Category deleted ✅", "success");
    void refresh();
    return res;
  } catch (e: unknown) {
    // Try to extract backend message
    let message = "Failed to delete category ❌";

    if (e instanceof Error) {
      message = e.message;
    } else if (typeof e === "string") {
      message = e;
    }

    showToast(message, "error");
  }
};

const deleteProductSafe = async (id: string) => {
  try {
    const res = await deleteProduct(id);

    showToast("Product deleted ✅", "success");
    void refresh();
    return res;
  } catch (e: unknown) {
    let message = "Failed to delete product ❌";

    if (e instanceof Error) {
      message = e.message;
    } else if (typeof e === "string") {
      message = e;
    }

    showToast(message, "error");
  }
};

  if (loading) return <p>Loading categories & products...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const count = cat.products?.length ?? 0;
        const isEditing = editingCategoryId === cat.id;
        const isOpen = expanded[cat.id];

        return (
          <div
            key={cat.id}
            className="bg-white border border-gray-200 rounded-xl shadow-sm"
          >
            <div
              className="flex items-center justify-between px-4 py-3 cursor-pointer"
              onClick={() => toggleExpand(cat.id)}
            >
              <div className="flex items-center gap-2">
                {isOpen ? (
                  <ChevronDown size={18} className="text-blue-600" />
                ) : (
                  <ChevronRight size={18} className="text-gray-500" />
                )}

                {!isEditing ? (
                  <h3 className="font-semibold">
                    {cat.name}{" "}
                    <span className="text-sm text-gray-500">({count})</span>
                  </h3>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      value={editCategoryName}
                      onChange={(e) => setEditCategoryName(e.target.value)}
                      className="border rounded-lg px-3 py-1 text-sm"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void saveCategory();
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-1 text-sm"
                    >
                      <Save size={14} /> Save
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategoryId(null);
                      }}
                      className="px-2 py-1 border rounded-lg hover:bg-gray-100 flex items-center gap-1 text-sm"
                    >
                      <X size={14} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {!isEditing && (
                <div
                  className="flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => {
                      setEditingCategoryId(cat.id);
                      setEditCategoryName(cat.name);
                    }}
                    className="px-2 py-1 border rounded-lg hover:bg-gray-100 text-sm flex items-center gap-1"
                  >
                    <Edit3 size={14} /> Edit
                  </button>
                  <button
                    onClick={() =>
                      askConfirm({
                        title: "Delete Category",
                        message:
                          "Are you sure? You can only delete a category with no products.",
                        action: () => deleteCategorySafe(cat.id),
                      })
                    }
                    className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm flex items-center gap-1"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              )}
            </div>

            {isOpen && (
              <div className="px-4 pb-4">
                {count === 0 ? (
                  <p className="text-gray-500 text-sm mt-2">No products</p>
                ) : (
                  <div className="mt-2 space-y-2">
                    {productsSorted(cat).map((p) => {
                      const pEditing = editingProductId === p.id;
                      return (
                        <div
                          key={p.id}
                          className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                        >
                          {!pEditing ? (
                            <>
                              <span className="text-sm">{p.name}</span>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setEditingProductId(p.id);
                                    setEditProductName(p.name);
                                    setEditProductCategoryId(p.category_id);
                                  }}
                                  className="px-2 py-1 border rounded-lg hover:bg-white text-xs flex items-center gap-1"
                                >
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() =>
                                    askConfirm({
                                      title: "Delete Product",
                                      message:
                                        "Delete this product? It must not be linked to any targets.",
                                      action: () => deleteProductSafe(p.id),
                                    })
                                  }
                                  className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs flex items-center gap-1"
                                >
                                  <Trash2 size={14} /> Delete
                                </button>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 w-full">
                              <div className="flex-1 flex items-center gap-2">
                                <input
                                  value={editProductName}
                                  onChange={(e) => setEditProductName(e.target.value)}
                                  className="border rounded-lg px-3 py-1 text-sm w-full"
                                />
                                <select
                                  value={editProductCategoryId}
                                  onChange={(e) =>
                                    setEditProductCategoryId(e.target.value)
                                  }
                                  className="border rounded-lg px-3 py-1 text-sm"
                                >
                                  {allCategories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => void saveProduct()}
                                  className="px-2 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs flex items-center gap-1"
                                >
                                  <Save size={14} /> Save
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingProductId(null);
                                  }}
                                  className="px-2 py-1 border rounded-lg hover:bg-white text-xs flex items-center gap-1"
                                >
                                  <X size={14} /> Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Confirm Dialog */}
      {confirm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-5 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-2">{confirm.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{confirm.message}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirm(null)}
                className="px-3 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => void doConfirm()}
                className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryProductList;
