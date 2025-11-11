import React, { useEffect, useState } from "react";
import {
  getOverallMonthlySummary,
  getAvailableYears,
} from "../services/analyticsService";
import type { MonthlySummary } from "../types/analytics";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
  ResponsiveContainer,
} from "recharts";

// 🎨 Corporate Colors
const TARGET_COLOR = "#005BAA"; // Blue
const ACHIEVEMENT_COLOR = "#FF8A00"; // Orange
const PERCENTAGE_COLOR = "#16a34a"; // Green

// Local typing for tooltip
type TTPayload = { value?: number | string; name?: string; dataKey?: string }[];
interface TTProps {
  active?: boolean;
  payload?: TTPayload;
  label?: number | string;
}

// Format Rp
const formatRp = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

// Custom Tooltip with percentage
const CustomTooltip = ({ active, payload, label }: TTProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const target = Number(payload.find((p) => p.dataKey === "target")?.value ?? 0);
  const achievement = Number(
    payload.find((p) => p.dataKey === "achievement")?.value ?? 0
  );
  const percentage = Number(
    payload.find((p) => p.dataKey === "percentage")?.value ?? 0
  );

  const diff = achievement - target;
  const isPositive = diff >= 0;
  const arrow = isPositive ? "↑" : "↓";
  const diffColor = isPositive ? "#16a34a" : "#dc2626"; // green / red
  const diffSign = isPositive ? "+" : "–";

  const monthIndex = Number(label);
  const monthName =
    [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ][monthIndex - 1] ?? String(label);

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
        Achievement:{" "}
        <span style={{ fontWeight: 500 }}>
          {formatRp(achievement)} ({percentage.toFixed(2)}%)
        </span>
      </p>
      <p
        style={{
          margin: "6px 0 0",
          fontSize: 13,
          fontWeight: 600,
          color: diffColor,
        }}
      >
        {arrow} {diffSign} {formatRp(Math.abs(diff))}
      </p>
    </div>
  );
};

const OverallTargetAchievementChart: React.FC = () => {
  const [data, setData] = useState<MonthlySummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(
    undefined
  );
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
        setError(
          err instanceof Error ? err.message : "Failed to fetch summary data"
        );
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
        <ResponsiveContainer width="100%" height={440}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

            {/* Month axis */}
            <XAxis
              dataKey="month"
              tickFormatter={(m) =>
                [
                  "Jan",
                  "Feb",
                  "Mar",
                  "Apr",
                  "May",
                  "Jun",
                  "Jul",
                  "Aug",
                  "Sep",
                  "Oct",
                  "Nov",
                  "Dec",
                ][m - 1]
              }
              tick={{ fontSize: 12, fill: "#4b5563" }}
            />

            {/* Left Y-axis (Rp) */}
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => formatRp(Number(v))}
              tick={{ fontSize: 8, fill: "#4b5563" }}
            />

            {/* Right Y-axis (Percentage) */}
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={(v) => `${v}%`}
              tick={{ fontSize: 10, fill: PERCENTAGE_COLOR }}
              domain={[0, "auto"]}
            />

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              align="center"
              wrapperStyle={{ fontSize: 13, marginTop: 10 }}
            />

            {/* Bars */}
            <Bar yAxisId="left" dataKey="target" fill={TARGET_COLOR} name="Target" />
            <Bar
              yAxisId="left"
              dataKey="achievement"
              fill={ACHIEVEMENT_COLOR}
              name="Achievement"
            />

            {/* Percentage line */}
<Line
  dataKey="percentage"
  stroke="transparent"
  dot={false}
  activeDot={false}
  legendType="none"
/>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default OverallTargetAchievementChart;
