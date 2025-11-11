import React, { useEffect, useState, useMemo } from "react";
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
  ResponsiveContainer,
} from "recharts";
import { RotateCcw } from "lucide-react";

const TARGET_COLOR = "#005BAA";
const ACHIEVEMENT_COLOR = "#FF8A00";
const PERCENTAGE_COLOR = "#16a34a";

type TTPayload = { value?: number | string; name?: string; dataKey?: string }[];
interface TTProps {
  active?: boolean;
  payload?: TTPayload;
  label?: number | string;
}

const formatRp = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

// Custom Tooltip
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
  const diffColor = isPositive ? "#16a34a" : "#dc2626";
  const diffSign = isPositive ? "+" : "–";

  const monthIndex = Number(label);
  const monthName =
    [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December",
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
      <p style={{ margin: 0, fontWeight: 600 }}>{monthName}</p>
      <p style={{ margin: "4px 0", fontSize: 13 }}>🎯 Target: {formatRp(target)}</p>
      <p style={{ margin: 0, fontSize: 13 }}>
        🏆 Achievement: {formatRp(achievement)} ({percentage.toFixed(2)}%)
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 13, fontWeight: 600, color: diffColor }}>
        {diffSign} {formatRp(Math.abs(diff))}
      </p>
    </div>
  );
};

const OverallTargetAchievementChart: React.FC = () => {
  const [data, setData] = useState<MonthlySummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [fromMonth, setFromMonth] = useState<number | "all">("all");
  const [toMonth, setToMonth] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

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
        setLoading(true);
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

  const clearFilters = () => {
    setFromMonth("all");
    setToMonth("all");
  };

  // Apply month range filtering
  const filteredData = useMemo(() => {
    if (fromMonth === "all" || toMonth === "all") return data;
    return data.filter((item) => item.month >= fromMonth && item.month <= toMonth);
  }, [data, fromMonth, toMonth]);

  if (loading) return <p>Loading overall summary...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-2xl font-semibold flex-1 text-[#005BAA]">
          🧮 Overall Target vs Achievement
        </h2>

        {/* Year Selector */}

      </div>

{/* Filters */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 text-sm w-full">
  {/* Left Filters */}
  <div className="flex flex-wrap items-center gap-2">
    {/* Year */}
    <label className="font-medium">Year:</label>
    <select
      value={selectedYear ?? ""}
      onChange={(e) => setSelectedYear(Number(e.target.value))}
      className="border rounded-lg px-3 py-2"
    >
      {availableYears.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>

    {/* From Month */}
    <span className="font-medium ml-2">From:</span>
    <select
      value={fromMonth}
      onChange={(e) =>
        setFromMonth(e.target.value === "all" ? "all" : Number(e.target.value))
      }
      className="border rounded-lg px-3 py-2"
    >
      <option value="all">Month</option>
      {months.map((m) => (
        <option key={m} value={m}>
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]}
        </option>
      ))}
    </select>

    {/* Arrow */}
    <span className="font-medium text-gray-500">→</span>

    {/* To Month */}
    <label className="font-medium">To:</label>
    <select
      value={toMonth}
      onChange={(e) =>
        setToMonth(e.target.value === "all" ? "all" : Number(e.target.value))
      }
      className="border rounded-lg px-3 py-2"
    >
      <option value="all">Month</option>
      {months.map((m) => (
        <option key={m} value={m}>
          {["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]}
        </option>
      ))}
    </select>
  </div>

  {/* Clear Filter Icon Button */}
  <button
    onClick={clearFilters}
    title="Clear Filters"
    className="p-2 rounded-full border border-[#005BAA] text-[#005BAA] hover:bg-[#005BAA] hover:text-white transition ml-auto"
  >
    <RotateCcw size={18} />
  </button>
</div>


      {/* Chart */}
      {filteredData.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={440}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tickFormatter={(m) =>
                ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]
              }
              tick={{ fontSize: 12, fill: "#4b5563" }}
            />
            <YAxis
              yAxisId="left"
              tickFormatter={(v) => formatRp(Number(v))}
              tick={{ fontSize: 8, fill: "#4b5563" }}
            />
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
            <Bar yAxisId="left" dataKey="target" fill={TARGET_COLOR} name="Target" />
            <Bar
              yAxisId="left"
              dataKey="achievement"
              fill={ACHIEVEMENT_COLOR}
              name="Achievement"
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default OverallTargetAchievementChart;
