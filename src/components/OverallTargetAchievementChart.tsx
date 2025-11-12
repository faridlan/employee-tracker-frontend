import React, { useEffect, useState, useMemo } from "react";
import {
  getOverallMonthlySummary,
  getAvailableYears,
} from "../services/analyticsService";
import type { MonthlySummary } from "../types/analytics";
import {
  LineChart,
  Line,
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
// const PERCENTAGE_COLOR = "#16a34a";

const formatRp = (value: number) => `Rp ${value.toLocaleString("id-ID")}`;

interface TooltipPayloadItem {
  dataKey: string;
  value: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: number | string;
}

// ✅ Custom Tooltip
const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const achievement = payload.find((p) => p.dataKey === "achievement")?.value ?? 0;
  const percentage = target > 0 ? (Number(achievement) / Number(target)) * 100 : 0;
  const diff = achievement - target;
  const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";
  const diffSymbol = diff >= 0 ? "↑" : "↓";

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ];
  const monthName = monthNames[Math.max(0, Number(label) - 1)];

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
      <p style={{ margin: "4px 0 0", fontSize: 13 }}>
        🎯 Target: <strong>{formatRp(Number(target))}</strong>
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 13 }}>
        🏆 Achievement: <strong>{formatRp(Number(achievement))}</strong>
      </p>
      <p style={{ margin: "2px 0 0", fontSize: 13 }}>
        📊 Rate: <strong>{percentage.toFixed(2)}%</strong>
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 13, color: diffColor }}>
        {diffSymbol} Rp {Math.abs(diff).toLocaleString("id-ID")}
      </p>
    </div>
  );
};

const OverallTargetAchievementChart: React.FC = () => {
  const [data, setData] = useState<MonthlySummary[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [fromMonth, setFromMonth] = useState<number | "all">("all");
  const [toMonth, setToMonth] = useState<number | "all">("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Load available years
  useEffect(() => {
    getAvailableYears()
      .then((years) => {
        setAvailableYears(years);
        setSelectedYear(years[years.length - 1]);
      })
      .catch(() => setAvailableYears([]));
  }, []);

  // Fetch monthly data
  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getOverallMonthlySummary(selectedYear);
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch monthly summary");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // Apply month filters
  const filteredData = useMemo(() => {
    let filtered = [...data];
    if (fromMonth !== "all") filtered = filtered.filter((d) => d.month >= fromMonth);
    if (toMonth !== "all") filtered = filtered.filter((d) => d.month <= toMonth);
    return filtered;
  }, [data, fromMonth, toMonth]);

  const clearFilters = () => {
    setFromMonth("all");
    setToMonth("all");
  };

  if (loading) return <p>Loading monthly summary...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-2xl font-semibold flex-1 text-[#005BAA]">
          📈 Overall Target vs Achievement
        </h2>
      </div>

      {/* Filters (merged layout) */}
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

        {/* Clear Filter Icon */}
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
          <LineChart data={filteredData}>
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
            <Line
              type="monotone"
              dataKey="target"
              stroke={TARGET_COLOR}
              strokeWidth={3}
              name="Target"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="achievement"
              stroke={ACHIEVEMENT_COLOR}
              strokeWidth={3}
              name="Achievement"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default OverallTargetAchievementChart;
