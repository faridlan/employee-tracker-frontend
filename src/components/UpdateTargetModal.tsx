import { useEffect, useState } from "react";
import type { Target } from "../types/target";
import { updateTarget } from "../services/targetService";
import { getAllProducts } from "../services/productService";
import type { Product } from "../types/product";
import { useToast } from "./ToastProvider";
import IDRInput from "../components/common/IDRInput"; // ✅ Added

interface UpdateTargetModalProps {
  target: Target;
  onClose: () => void;
  onUpdated: () => void;
}

const UpdateTargetModal = ({ target, onClose, onUpdated }: UpdateTargetModalProps) => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState(target.product_id);

  // initial formatted
  const [nominal, setNominal] = useState(
    target.nominal.toLocaleString("id-ID").replace(/,/g, ".")
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const numericNominal = Number(nominal.replace(/\./g, "")); // ✅ convert to integer

      if (isNaN(numericNominal) || numericNominal < 0) {
        setError("Nominal must be a valid number");
        return;
      }

      await updateTarget(target.id, {
        product_id: productId,
        nominal: numericNominal,
      });

      showToast("✅ Target updated successfully!", "success");
      onUpdated();
      onClose();
    } catch (err) {
      showToast("❌ Failed to update target", "error");
      setError(err instanceof Error ? err.message : "Failed to update target");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-xl animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">Edit Target</h2>

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg mb-3 text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Employee (locked) */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee</label>
            <input
              value={target.employee?.name || ""}
              disabled
              className="w-full border rounded-lg px-3 py-2 bg-gray-200 cursor-not-allowed opacity-80"
            />
          </div>

          {/* Product */}
          <div>
            <label className="block text-sm font-medium mb-1">Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full border rounded-lg px-3 py-2 bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nominal (Formatted IDR) */}
          <IDRInput value={nominal} onChange={setNominal} required />

          {/* Month & Year (locked) */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Month</label>
              <input
                value={target.month}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-200 cursor-not-allowed opacity-80"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                value={target.year}
                disabled
                className="w-full border rounded-lg px-3 py-2 bg-gray-200 cursor-not-allowed opacity-80"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-[#815aa5] text-white rounded-lg hover:bg-[#A56BDB] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateTargetModal;
