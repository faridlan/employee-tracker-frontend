import React, { useEffect, useState } from "react";
import type { Target } from "../types/target";
import type { Product } from "../types/product";
import { getAllProducts } from "../services/productService";
import { updateTarget } from "../services/targetService";
import { createAchievement, updateAchievement } from "../services/achievementService";
import { useToast } from "./ToastProvider";
import IDRInput from "./common/IDRInput";

interface Props {
  target: Target;
  onClose: () => void;
  onUpdated: () => Promise<void>; // parent will refetch employee after success
}

const CombinedEditTargetAchievementModal: React.FC<Props> = ({
  target,
  onClose,
  onUpdated,
}) => {
  const { showToast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [productId, setProductId] = useState<string>(target.product_id);
  const [targetNominal, setTargetNominal] = useState<string>(
    target.nominal.toLocaleString("id-ID").replace(/,/g, ".")
  );
  const [achNominal, setAchNominal] = useState<string>(
    target.Achievement
      ? target.Achievement.nominal.toLocaleString("id-ID").replace(/,/g, ".")
      : ""
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAllProducts()
      .then(setProducts)
      .catch(() => setProducts([]));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Convert formatted strings to numbers
      const targetNom = Number(targetNominal.replace(/\./g, ""));
      const achNom = achNominal ? Number(achNominal.replace(/\./g, "")) : null;

      if (Number.isNaN(targetNom) || targetNom < 0) {
        setError("Target nominal must be a valid non-negative number.");
        return;
      }
      if (achNominal && (achNom === null || Number.isNaN(achNom) || achNom < 0)) {
        setError("Achievement nominal must be a valid non-negative number.");
        return;
      }

      // 1) Update target first
      await updateTarget(target.id, {
        product_id: productId,
        nominal: targetNom,
      });

      // 2) Create/update achievement
      if (achNominal) {
        if (target.Achievement) {
          await updateAchievement(target.id, achNom!);
        } else {
          await createAchievement({ target_id: target.id, nominal: achNom! });
        }
      } else if (target.Achievement && !achNominal) {
        // If previously existed but user cleared the field, keep as-is (no delete)
        // If you want to delete the achievement when cleared, implement a delete API and call here.
      }

      showToast("Target & Achievement saved ✅", "success");
      await onUpdated(); // parent will refetch employee and close
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-[440px] max-w-[92%] p-6">
        <h2 className="text-lg font-semibold mb-2">Edit Target & Achievement</h2>
        <p className="text-xs text-gray-500 mb-4">
          Month {target.month} • Year {target.year} • Employee {target.employee?.name || "—"}
        </p>

        {error && (
          <div className="mb-3 text-sm bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          {/* Product */}
          <div>
            <div className="text-sm font-medium mb-1">Product</div>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Target Nominal */}
          <div>
            <div className="text-sm font-medium mb-1">Target Nominal</div>
            <IDRInput value={targetNominal} onChange={setTargetNominal} required />
          </div>

          {/* Achievement Nominal (always shown, blank if none) */}
          <div>
            <div className="text-sm font-medium mb-1">
              {target.Achievement ? "Achievement Nominal" : "Achievement Nominal (optional)"}
            </div>
            <IDRInput value={achNominal} onChange={setAchNominal} />
            {!target.Achievement && (
              <p className="text-xs text-gray-500 mt-1">
                Leave empty if you don’t want to create an achievement yet.
              </p>
            )}
          </div>

          {/* Locked Month & Year */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-sm font-medium mb-1">Month</div>
              <input
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                value={target.month}
                disabled
              />
            </div>
            <div>
              <div className="text-sm font-medium mb-1">Year</div>
              <input
                className="w-full border rounded-lg px-3 py-2 bg-gray-100 cursor-not-allowed"
                value={target.year}
                disabled
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => !saving && onClose()}
              className="px-3 py-2 border rounded-lg hover:bg-gray-100 text-sm disabled:opacity-50"
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CombinedEditTargetAchievementModal;
