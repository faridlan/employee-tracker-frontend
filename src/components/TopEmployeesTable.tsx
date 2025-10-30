import React, { useEffect, useState } from "react";
import type { TopEmployee } from "../types/analytics";
import { getTopEmployeesByAchievement } from "../services/categoryService";


const TopEmployeesTable: React.FC = () => {
  const [data, setData] = useState<TopEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopEmployees = async () => {
      try {
        const result = await getTopEmployeesByAchievement();
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch top employees");
      } finally {
        setLoading(false);
      }
    };

    fetchTopEmployees();
  }, []);

  if (loading) return <p>Loading top employees...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">🏆 Top 5 Employees by Achievement</h2>

      {data.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Employee</th>
                <th className="px-4 py-2 text-left">Office</th>
                <th className="px-4 py-2 text-right">Total Target</th>
                <th className="px-4 py-2 text-right">Total Achievement</th>
                <th className="px-4 py-2 text-right">% Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.map((e, idx) => (
                <tr key={e.employee_id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{idx + 1}. {e.name}</td>
                  <td className="px-4 py-2">{e.office_location}</td>
                  <td className="px-4 py-2 text-right">
                    Rp {e.total_target.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2 text-right">
                    Rp {e.total_achievement.toLocaleString("id-ID")}
                  </td>
                  <td
                    className={`px-4 py-2 text-right font-semibold ${
                      e.achievement_rate >= 100
                        ? "text-green-600"
                        : e.achievement_rate >= 80
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {e.achievement_rate.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TopEmployeesTable;
