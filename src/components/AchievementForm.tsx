import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getAllTargets } from "../services/targetService";
import {
  createAchievement,
  updateAchievement,
} from "../services/achievementService";
import type { Target } from "../types/target";
import getMonthName from "../helper/month";
import IDRInput from "../components/common/IDRInput"; // ✅ Add this import

interface Props {
  onCreated: () => void;
}

const AchievementForm: React.FC<Props> = ({ onCreated }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [targetId, setTargetId] = useState("");
  const [nominal, setNominal] = useState(""); // now formatted string
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

  useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(false), 3000); // hide after 3s
    return () => clearTimeout(timer);
  }
}, [success]);

  const handleTargetChange = (id: string) => {
    setTargetId(id);
    const found = targets.find((t) => t.id === id) || null;
    setSelectedTarget(found);

    if (updateMode && found?.Achievement) {
      // ✅ Format initial value to "1.000.000"
      setNominal(found.Achievement.nominal.toLocaleString("id-ID").replace(/,/g, "."));
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
    const numericNominal = Number(nominal.replace(/\./g, ""));

    if (updateMode) {
      await updateAchievement(targetId, numericNominal);
    } else {
      await createAchievement({
        target_id: targetId,
        nominal: numericNominal,
      });
    }

    // ✅ Re-fetch updated targets here
    const updatedTargets = await getAllTargets();
    setTargets(updatedTargets);

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

  const selectableTargets = updateMode
    ? targets.filter((t) => t.Achievement)
    : targets.filter((t) => !t.Achievement);

  const targetOptions = selectableTargets.map((t) => ({
    value: t.id,
    label: t.employee?.name
      ? `${t.employee.name} - ${t.Product?.name || "No Product"} (${getMonthName(t.month)}-${t.year})`
      : t.id,
  }));

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

          <Select
            options={targetOptions}
            value={targetOptions.find((opt) => opt.value === targetId) || null}
            onChange={(selected) => handleTargetChange(selected?.value || "")}
            placeholder="Search Target..."
            isSearchable
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: "#000",
                boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
                "&:hover": { borderColor: "#000" },
                borderRadius: "0.5rem",
                padding: "2px 4px",
                minHeight: "42px",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                marginTop: 4,
                zIndex: 10,
              }),
            }}
          />

          {selectedTarget && (
            <div className="mt-2 text-sm bg-gray-50 border border-gray-200 rounded-lg p-2">
              <p>
                🎯 <strong>Target Nominal:</strong> Rp {selectedTarget.nominal.toLocaleString()}
              </p>
              <p>
                📅 <strong>Month/Year:</strong> {getMonthName(selectedTarget.month)}-{selectedTarget.year}
              </p>
              <p>
                🧑‍💼 <strong>Employee:</strong> {selectedTarget.employee?.name || "—"}
              </p>
              <p>
                📦 <strong>Product:</strong> {selectedTarget.Product?.name || "—"}
              </p>

              {updateMode && selectedTarget.Achievement && (
                <p className="mt-2 text-blue-600">
                  💾 <strong>Current Achievement:</strong> Rp {selectedTarget.Achievement.nominal.toLocaleString()}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Achievement Nominal (Formatted IDR) */}
        <div>
          <IDRInput
            label={updateMode ? "New Achievement Nominal" : "Achievement Nominal"}
            value={nominal}
            onChange={setNominal}
            required
          />
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
        {loading ? "Saving..." : updateMode ? "Update Achievement" : "Add Achievement"}
      </button>
    </form>
  );
};

export default AchievementForm;
