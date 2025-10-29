import React, { useEffect, useState } from "react";
import type { Achievement } from "../types/achievement";
import { getAllAchievements } from "../services/achievementService";

interface Props {
  refreshTrigger: number;
}

const AchievementList: React.FC<Props> = ({ refreshTrigger }) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAchievements = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllAchievements();
        setAchievements(data);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch achievements");
      } finally {
        setLoading(false);
      }
    };
    fetchAchievements();
  }, [refreshTrigger]);

  if (loading) return <p>Loading achievements...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Achievements List</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-center">Month/Year</th>
              <th className="px-4 py-2 text-right">Nominal</th>
              <th className="px-4 py-2 text-left">Created At</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((a) => (
              <tr key={a.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">
                  {a.target?.employee?.name || "—"}
                </td>
                <td className="px-4 py-2">
                  {a.target?.Product?.name || "—"}
                </td>
                <td className="px-4 py-2 text-center">
                  {a.target
                    ? `${a.target.month}/${a.target.year}`
                    : "—"}
                </td>
                <td className="px-4 py-2 text-right">
                  Rp {a.nominal.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {new Date(a.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AchievementList;
