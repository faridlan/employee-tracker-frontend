import React, { useEffect, useState } from "react";
import type { Target } from "../types/target";
import { getAllTargets } from "../services/targetService";

interface Props {
  refreshTrigger: number;
}

const TargetList: React.FC<Props> = ({ refreshTrigger }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTargets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllTargets();
        if (Array.isArray(data)) setTargets(data);
        else setTargets([]);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch targets");
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [refreshTrigger]);

  if (loading) return <p>Loading targets...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">All Targets</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-right">Nominal</th>
              <th className="px-4 py-2 text-left">Month</th>
              <th className="px-4 py-2 text-left">Year</th>
              <th className="px-4 py-2 text-right">Achievement</th>
            </tr>
          </thead>
          <tbody>
            {targets.map((t) => (
              <tr key={t.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{t.employee?.name || "—"}</td>
                <td className="px-4 py-2">{t.Product?.name || "—"}</td>
                <td className="px-4 py-2 text-right">Rp {t.nominal.toLocaleString()}</td>
                <td className="px-4 py-2">{t.month}</td>
                <td className="px-4 py-2">{t.year}</td>
                <td className="px-4 py-2 text-right">
                  {t.Achievement ? `Rp ${t.Achievement.nominal.toLocaleString()}` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TargetList;
