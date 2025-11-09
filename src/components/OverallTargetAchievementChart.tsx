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

// 🔵 Bank Galuh Corporate Colors for Bar Chart
const TARGET_COLOR = "#005BAA";      // Primary Blue
const ACHIEVEMENT_COLOR = "#FF8A00"; // Brand Orange

// Local typing for Recharts v3 tooltip props (avoids type-only import quirks)
type TTPayload = { value?: number | string; name?: string }[];
interface TTProps {
  active?: boolean;
  payload?: TTPayload;
  label?: number | string;
}

// Format Rp (Indonesian)
const formatRp = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

// Custom Tooltip (Arrow + Color + +/-)
const CustomTooltip = ({ active, payload, label }: TTProps) => {
  if (!active || !payload || payload.length < 2) return null;

  const target = Number(payload[0]?.value ?? 0);
  const achievement = Number(payload[1]?.value ?? 0);
  const diff = achievement - target;

  const isPositive = diff >= 0;
  const arrow = isPositive ? "↑" : "↓";
  const diffColor = isPositive ? "#16a34a" : "#dc2626"; // green / red
  const diffSign = isPositive ? "+" : "–";

  const monthIndex = Number(label);
  const monthName =
    ["January","February","March","April","May","June",
     "July","August","September","October","November","December"][monthIndex - 1] ?? String(label);

  return (
    <div
      style={{
        background: "white",
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>{monthName}</p>
      <p style={{ margin: "4px 0 0", fontSize: 13 }}>
        Target: <span style={{ fontWeight: 500 }}>{formatRp(target)}</span>
      </p>
      <p style={{ margin: 0, fontSize: 13 }}>
        Achievement: <span style={{ fontWeight: 500 }}>{formatRp(achievement)}</span>
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 600, color: diffColor }}>
        {arrow} {diffSign} {formatRp(Math.abs(diff))}
      </p>
    </div>
  );
};

const OverallTargetAchievementChart: React.FC = () => {
  const [data, setData] = useState<MonthlySummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load years
  useEffect(() => {
    getAvailableYears()
      .then((years) => {
        setAvailableYears(years);
        setSelectedYear(years[years.length - 1]);
      })
      .catch(() => setAvailableYears([]));
  }, []);

  // Fetch data
  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      try {
        const result = await getOverallMonthlySummary(selectedYear);
        setData(result);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch summary data");
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <h2 className="text-2xl font-semibold flex-1 text-[#005BAA]">
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
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            <XAxis
              dataKey="month"
              tickFormatter={(m) =>
                ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]
              }
              tick={{ fontSize: 12, fill: "#4b5563" }}
            />

            <YAxis
              tickFormatter={(v) => formatRp(Number(v))}
              tick={{ fontSize: 12, fill: "#4b5563" }}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 13, marginTop: 10 }}
            />

            <Bar dataKey="target" fill={TARGET_COLOR} name="Target" />
            <Bar dataKey="achievement" fill={ACHIEVEMENT_COLOR} name="Achievement" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default OverallTargetAchievementChart;
