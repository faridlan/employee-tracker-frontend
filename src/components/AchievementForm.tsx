import React, { useEffect, useState } from "react";
import { getAllTargets } from "../services/targetService";
import {
  createAchievement,
  updateAchievement,
} from "../services/achievementService";
import type { Target } from "../types/target";

interface Props {
  onCreated: () => void;
}

const AchievementForm: React.FC<Props> = ({ onCreated }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetId, setTargetId] = useState("");
  const [nominal, setNominal] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);
  const [updateMode, setUpdateMode] = useState(false);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const data = await getAllTargets();
        setTargets(data);
      } catch {
        setTargets([]);
      }
    };
    fetchTargets();
  }, []);

  const handleTargetChange = (id: string) => {
    setTargetId(id);
    const found = targets.find((t) => t.id === id) || null;
    setSelectedTarget(found);

    // 🧩 Prefill nominal when updating
    if (updateMode && found?.Achievement) {
      setNominal(found.Achievement.nominal.toString());
    } else {
      setNominal("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (updateMode) {
        await updateAchievement(targetId, Number(nominal));
      } else {
        await createAchievement({
          target_id: targetId,
          nominal: Number(nominal),
        });
      }

      setSuccess(true);
      setTargetId("");
      setSelectedTarget(null);
      setNominal("");
      onCreated();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to save achievement");
    } finally {
      setLoading(false);
    }
  };

  // 🧩 Show available or existing targets based on mode
  const selectableTargets = updateMode
    ? targets.filter((t) => t.Achievement) // existing ones
    : targets.filter((t) => !t.Achievement); // available ones

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {updateMode ? "Update Achievement" : "Add New Achievement"}
        </h2>
        <button
          type="button"
          onClick={() => {
            setUpdateMode((prev) => !prev);
            setTargetId("");
            setSelectedTarget(null);
            setNominal("");
            setError(null);
            setSuccess(false);
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          {updateMode ? "Switch to Create Mode" : "Switch to Update Mode"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg mb-2">
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg mb-2">
          ✅ Achievement {updateMode ? "updated" : "created"} successfully!
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Target */}
        <div>
          <label className="block text-sm font-medium mb-1">Target</label>
          <select
            value={targetId}
            onChange={(e) => handleTargetChange(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Target</option>
            {selectableTargets.map((t) => (
              <option key={t.id} value={t.id}>
                {t.employee?.name
                  ? `${t.employee.name} - ${t.Product?.name || "No Product"} (${t.month}/${t.year})`
                  : t.id}
              </option>
            ))}
          </select>

          {/* ✅ Show target info if selected */}
          {selectedTarget && (
            <div className="mt-2 text-sm bg-gray-50 border border-gray-200 rounded-lg p-2">
              <p>
                🎯 <strong>Target Nominal:</strong>{" "}
                Rp {selectedTarget.nominal.toLocaleString()}
              </p>
              <p>
                📅 <strong>Month/Year:</strong>{" "}
                {selectedTarget.month}/{selectedTarget.year}
              </p>
              <p>
                🧑‍💼 <strong>Employee:</strong>{" "}
                {selectedTarget.employee?.name || "—"}
              </p>
              <p>
                📦 <strong>Product:</strong>{" "}
                {selectedTarget.Product?.name || "—"}
              </p>

              {/* ✅ Show current achievement if in update mode */}
              {updateMode && selectedTarget.Achievement && (
                <p className="mt-2 text-blue-600">
                  💾 <strong>Current Achievement:</strong>{" "}
                  Rp {selectedTarget.Achievement.nominal.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Achievement Nominal */}
        <div>
          <label className="block text-sm font-medium mb-1">
            {updateMode ? "New Achievement Nominal" : "Achievement Nominal"}
          </label>
          <input
            type="number"
            value={nominal}
            onChange={(e) => setNominal(e.target.value)}
            required
            min="0"
            className="w-full border rounded-lg px-3 py-2"
            placeholder={
              updateMode ? "Enter updated amount" : "Enter achieved amount"
            }
          />

          {/* Optional guidance */}
          {selectedTarget && !updateMode && (
            <p className="text-xs text-gray-500 mt-1">
              (Target is Rp {selectedTarget.nominal.toLocaleString()})
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading
          ? "Saving..."
          : updateMode
          ? "Update Achievement"
          : "Add Achievement"}
      </button>
    </form>
  );
};

export default AchievementForm;
