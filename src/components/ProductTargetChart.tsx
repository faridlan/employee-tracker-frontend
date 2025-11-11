import React, { useEffect, useState, useMemo } from "react";
import {
  getProductTargetSummary,
  getAvailableYears,
} from "../services/analyticsService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProductSummary } from "../types/analytics";
import getMonthName from "../helper/month";
import { RotateCcw } from "lucide-react";

// 🔵 Bank Galuh Corporate Blue Palette
const BLUE_COLORS = ["#005BAA", "#2E6EBE", "#4C89CF", "#7FB1E3", "#A7CCED", "#C7E0F6"];
const ORANGE = "#FF8A00";

// Extend ProductSummary type to include month & year (from backend)
type ProductSummaryWithDate = ProductSummary & {
  month: number;
  year: number;
};

// Format number to short K/M/B format
const formatShort = (num: number): string => {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(1)}K`;
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const ProductTargetChart: React.FC = () => {
  const [data, setData] = useState<ProductSummaryWithDate[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
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
        setSelectedYear(years[years.length - 1]); // Default to most recent year
      })
      .catch(() => setAvailableYears([]));
  }, []);

  // Fetch product target summary (with month/year from backend)
  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getProductTargetSummary(selectedYear);
        // Convert numeric fields safely
        const mapped: ProductSummaryWithDate[] = result.map((item) => ({
          ...item,
          month: Number(item.month),
          year: Number(item.year),
          total_nominal: Number(item.total_nominal || 0),
        }));
        setData(mapped);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  // Clear filters
  const clearFilters = () => {
    setFromMonth("all");
    setToMonth("all");
    if (availableYears.length > 0) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  };

  // Filter by month range (frontend)
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (fromMonth === "all" || toMonth === "all") return true;
      return item.month >= fromMonth && item.month <= toMonth;
    });
  }, [data, fromMonth, toMonth]);

  // Aggregate totals per product (sum across selected months)
  const aggregatedData = useMemo(() => {
    const grouped = new Map<string, number>();
    filteredData.forEach((item) => {
      const prev = grouped.get(item.product_name) || 0;
      grouped.set(item.product_name, prev + item.total_nominal);
    });
    return Array.from(grouped.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredData]);

  if (loading) return <p>Loading product chart...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  // Identify the highest slice
  const highestValue = Math.max(...aggregatedData.map((d) => d.value));
  const highestName = aggregatedData.find((d) => d.value === highestValue)?.name;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4 text-[#005BAA]">
        📊 Product Target Distribution
      </h2>

{/* Filter Bar */}
<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 text-sm w-full transition-all duration-300 ease-in-out">
  {/* Left Section – Year & Month Filters */}
  <div className="flex flex-wrap items-center gap-2 md:gap-3">
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

    <span className="font-medium ml-1">From:</span>
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
          {getMonthName ? getMonthName(m) : m}
        </option>
      ))}
    </select>

    <span className="text-gray-400 font-medium">→</span>

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
          {getMonthName ? getMonthName(m) : m}
        </option>
      ))}
    </select>
  </div>

  {/* Right Section – Clear Filter Icon */}
  <button
    onClick={clearFilters}
    title="Clear Filters"
    className="p-2 rounded-full border border-[#005BAA] text-[#005BAA] hover:bg-[#005BAA] hover:text-white transition"
  >
    <RotateCcw size={18} />
  </button>
</div>

      {/* Chart */}
      {aggregatedData.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <PieChart>
            <Pie
              data={aggregatedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              fontSize={10}
              outerRadius={140}
              labelLine
              label={({ name, value }) => `${name}: ${formatShort(value as number)}`}
            >
              {aggregatedData.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.name === highestName ? ORANGE : BLUE_COLORS[i % BLUE_COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: unknown) =>
                `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`
              }
            />

            <Legend
              formatter={(value: string) => {
                const item = aggregatedData.find((d) => d.name === value);
                const val = item?.value ?? 0;
                return `${value} – Rp ${val.toLocaleString("id-ID")}`;
              }}
              wrapperStyle={{ fontSize: 13, paddingTop: 10 }}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductTargetChart;
