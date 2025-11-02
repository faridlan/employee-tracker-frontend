import React, { useEffect, useState } from "react";
import { getOverallMonthlySummary, getAvailableYears } from "../services/analyticsService";
import type { MonthlySummary } from "../types/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const OverallTargetAchievementChart: React.FC = () => {
  const [data, setData] = useState<MonthlySummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAvailableYears()
      .then((years) => {
        setAvailableYears(years);
        setSelectedYear(years[years.length - 1]);
      })
      .catch(() => setAvailableYears([]));
  }, []);

  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      try {
        const result = await getOverallMonthlySummary(selectedYear);
        setData(result);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch summary data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) return <p>Loading overall summary...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <h2 className="text-2xl font-semibold flex-1">
          🧮 Overall Target vs Achievement
        </h2>

        {/* Year Selector */}
        <select
          value={selectedYear ?? ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 mt-2 sm:mt-0"
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {data.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
<ResponsiveContainer width="100%" height={400}>
  <BarChart data={data}>
    <CartesianGrid strokeDasharray="3 3" />

    {/* ✅ Month Name Short Format */}
    <XAxis
      dataKey="month"
      tickFormatter={(m) =>
        ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]
      }
    />

    <YAxis
      tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID")}`}
      tick={{ fontSize: 8, fill: "#4b5563" }}
    />

<Tooltip
  formatter={(value: number, name: string) => [
    `Rp ${Number(value).toLocaleString("id-ID")}`,
    name,
  ]}
  labelFormatter={(label) =>
    [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ][label - 1]
  }
/>
    <Legend />

    <Bar dataKey="target" fill="#2563eb" name="Target" />
    <Bar dataKey="achievement" fill="#16a34a" name="Achievement" />
  </BarChart>
</ResponsiveContainer>

      )}
    </div>
  );
};

export default OverallTargetAchievementChart;
