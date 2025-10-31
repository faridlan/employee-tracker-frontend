import React, { useEffect, useState } from "react";
import { getEmployeePerformance, getAvailableYears } from "../services/analyticsService";
import type { EmployeePerformance } from "../types/analytics";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import getMonthName from "../helper/month";

interface Props {
  employeeId: string;
}

const EmployeeChartForDetail: React.FC<Props> = ({ employeeId }) => {
  const [data, setData] = useState<EmployeePerformance[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧩 Load available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
        setSelectedYear(years[years.length - 1]);
      } catch {
        setAvailableYears([]);
      }
    };
    fetchYears();
  }, []);

  // 🧩 Load performance data
  useEffect(() => {
    if (!employeeId || !selectedYear) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result = await getEmployeePerformance(employeeId, selectedYear);

        // ✅ Normalize backend "month": "2025-01" → month: 1
        const normalized = result.map((r) => {
          const parts = String(r.month).split("-");
          const monthNumber = Number(parts[1]); // extract "01" → 1
          return {
            ...r,
            month: monthNumber,
          };
        });

        // ✅ Sort months (1–12)
        normalized.sort((a, b) => a.month - b.month);

        setData(normalized);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch performance data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [employeeId, selectedYear]);

  return (
    <div className="bg-white p-6 rounded-xl shadow mt-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">
          📈 Performance Chart
        </h2>
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Year:</label>
          <select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
            disabled={availableYears.length === 0}
          >
            {availableYears.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && <p className="text-gray-500">Loading performance chart...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={360}>
          <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tickFormatter={(m) => getMonthName(Number(m)).substring(0, 3)}
              tick={{
                fontSize: 13,
                fill: "#374151",
                fontWeight: 500,
              }}
              tickMargin={10}
              axisLine={{ stroke: "#9ca3af" }}
              tickLine={{ stroke: "#9ca3af" }}
            />
            <YAxis
              tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID")}`}
              tick={{
                fontSize: 13,
                fill: "#374151",
                fontWeight: 500,
              }}
              width={110}
              tickMargin={8}
              axisLine={{ stroke: "#9ca3af" }}
              tickLine={{ stroke: "#9ca3af" }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const target = payload.find((p) => p.dataKey === "target");
                  const achievement = payload.find((p) => p.dataKey === "achievement");
                  const percentage =
                    achievement && target
                      ? ((Number(achievement.value) / Number(target.value)) * 100) || 0
                      : 0;
                  return (
                    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow text-sm">
                      <p className="font-semibold mb-1 text-gray-800">
                        {getMonthName(Number(label))}
                      </p>
                      <p>🎯 Target: Rp {Number(target?.value).toLocaleString("id-ID")}</p>
                      <p>🏆 Achievement: Rp {Number(achievement?.value).toLocaleString("id-ID")}</p>
                      <p
                        className={`font-semibold ${
                          percentage >= 100 ? "text-green-600" : "text-blue-600"
                        }`}
                      >
                        📊 {percentage.toFixed(2)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ fontSize: 13, color: "#374151" }}
            />
            <Line
              type="monotone"
              dataKey="target"
              stroke="#2f8bcc"
              strokeWidth={2.5}
              name="Target"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="achievement"
              stroke="#16a34a"
              strokeWidth={2.5}
              name="Achievement"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && data.length === 0 && (
        <p className="text-gray-500">No performance data available for this year.</p>
      )}
    </div>
  );
};

export default EmployeeChartForDetail;
