import { useEffect, useState } from "react";
import {
  getMonthlySummaryByCategory,
  getAvailableYears,
} from "../services/analyticsService";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// --- Types ---
interface CategoryMonthlySummary {
  category_name: string;
  months: {
    month: number;
    target: number;
    achievement: number;
    percentage: number;
  }[];
}

// Format numbers into B/M/K (must return string)
const formatShort = (n: number): string => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return n.toString();
};

const COLORS = {
  target: "#005BAA",
  achievement: "#FF8A00",
};

const CategoryLineCharts = () => {
  const [year, setYear] = useState<number>();
  const [years, setYears] = useState<number[]>([]);
  const [data, setData] = useState<CategoryMonthlySummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Load years
  useEffect(() => {
    getAvailableYears().then((y) => {
      setYears(y);
      setYear(y[y.length - 1]); // latest year
    });
  }, []);

  // Load category monthly summary
  useEffect(() => {
    if (!year) return;

    setLoading(true);
    getMonthlySummaryByCategory(year)
      .then((result) => setData(result))
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <p>Loading charts...</p>;

  return (
    <div className="space-y-8">
      {/* Year Selector */}
      <div className="flex items-center gap-2 mb-4">
        <label className="font-medium">Year:</label>
        <select
          value={year ?? ""}
          onChange={(e) => setYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2"
        >
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Render chart per category */}
      {data.map((cat) => (
        <div key={cat.category_name} className="bg-white p-6 rounded-xl shadow">
          <h3 className="text-xl font-bold text-[#005BAA] mb-4">
            📊 {cat.category_name} — Monthly Performance
          </h3>

          <ResponsiveContainer width="100%" height={420}>
            <LineChart data={cat.months}>
              <CartesianGrid strokeDasharray="4 4" stroke="#d1d5db" />

              <XAxis
                dataKey="month"
                tickFormatter={(m: number) =>
                  ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m - 1]
                }
              />

              <YAxis
                tickFormatter={(v: number) => formatShort(v)} // returns string only
                padding={{ top: 20, bottom: 20 }}
              />

              <Tooltip />

              <Legend />

              <Line
                type="monotone"
                dataKey="target"
                stroke={COLORS.target}
                strokeWidth={3}
              />

              <Line
                type="monotone"
                dataKey="achievement"
                stroke={COLORS.achievement}
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
};

export default CategoryLineCharts;
