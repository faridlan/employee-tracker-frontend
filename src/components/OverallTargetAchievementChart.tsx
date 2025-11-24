import React, { useEffect, useState } from "react";
import {
  getMonthlySummaryByCategory,
  getAvailableYears,
} from "../services/analyticsService";

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

// Short format B/M/K
const formatShort = (value: number): string => {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
};

// Types
interface CategoryMonthData {
  month: number;
  target: number;
  achievement: number;
  percentage: number;
}

interface CategorySummary {
  category_name: string;
  months: CategoryMonthData[];
}

// Tooltip Props
interface TooltipItem {
  dataKey: string;
  value: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipItem[];
  label?: number;
}

// Tooltip Component
const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
}) => {
  if (!active || !payload || payload.length === 0 || !label) return null;

  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const achievement =
    payload.find((p) => p.dataKey === "achievement")?.value ?? 0;

  const percentage = target > 0 ? (achievement / target) * 100 : 0;
  const diff = achievement - target;
  const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";
  const diffSymbol = diff >= 0 ? "↑" : "↓";

  const monthName = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
  ][label - 1];

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
      <p>🎯 Target: Rp {target.toLocaleString("id-ID")}</p>
      <p>🏆 Achievement: Rp {achievement.toLocaleString("id-ID")}</p>
      <p>📊 Rate: {percentage.toFixed(2)}%</p>
      <p style={{ color: diffColor }}>
        {diffSymbol} Rp {Math.abs(diff).toLocaleString("id-ID")}
      </p>
    </div>
  );
};

const OverallTargetAchievementChart: React.FC = () => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>();
  const [fromMonth, setFromMonth] = useState<number | "all">("all");
  const [toMonth, setToMonth] = useState<number | "all">("all");
  const [data, setData] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // Load years
  useEffect(() => {
    getAvailableYears().then((years) => {
      setAvailableYears(years);
      setSelectedYear(years[years.length - 1]);
    });
  }, []);

  // Load category monthly data
  useEffect(() => {
    if (!selectedYear) return;
    setLoading(true);

    getMonthlySummaryByCategory(selectedYear)
      .then((res: CategorySummary[]) => setData(res))
      .finally(() => setLoading(false));
  }, [selectedYear]);

  const filterMonths = (list: CategoryMonthData[]) => {
    return list.filter((item) => {
      if (fromMonth !== "all" && item.month < fromMonth) return false;
      if (toMonth !== "all" && item.month > toMonth) return false;
      return true;
    });
  };

  if (loading) return <p>Loading category charts...</p>;

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-2xl font-semibold text-[#005BAA]">
          📈 Target vs Achievement Per Category
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <label>Year:</label>
          <select
            value={selectedYear ?? ""}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            {availableYears.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>

          <span>From:</span>
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
                {m}
              </option>
            ))}
          </select>

          <span>→</span>

          <span>To:</span>
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
                {m}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              setFromMonth("all");
              setToMonth("all");
            }}
            className="p-2 rounded-full border border-[#005BAA] text-[#005BAA]"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Render one line chart per category */}
      {data.map((category) => {
        const filtered = filterMonths(category.months);

        const yValues = filtered.flatMap((m) => [m.target, m.achievement]);
        const nonZero = yValues.filter((v) => v > 0);

        const minY = nonZero.length ? Math.min(...nonZero) * 0.8 : 1;
        const maxY = Math.max(...yValues) * 1.1;

        return (
          <div
            key={category.category_name}
            className="bg-white p-6 rounded-xl shadow"
          >
            <h3 className="text-xl font-semibold text-[#005BAA] mb-4">
              📦 {category.category_name}
            </h3>

                    <ResponsiveContainer width="100%" height={440}>
          <LineChart data={filtered}>
            <CartesianGrid strokeDasharray="4 4" stroke="#d1d5db" opacity={0.7} />

            <XAxis
              dataKey="month"
              tickFormatter={(m) =>
                ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]
              }
              tick={{ fontSize: 12, fill: "#4b5563" }}
            />

            <YAxis
              domain={[minY, maxY]}
              allowDataOverflow={true}   // ← ⭐ FORCE TO IGNORE ZERO
              tickFormatter={(v) => formatShort(Number(v))}
              tick={{ fontSize: 12, fill: "#4b5563" }}
              padding={{ top: 20, bottom: 20 }}
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
          </div>
        );
      })}
    </div>
  );
};

export default OverallTargetAchievementChart;
