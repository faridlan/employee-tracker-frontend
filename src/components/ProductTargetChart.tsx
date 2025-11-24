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

// Colors
const BLUE_COLORS = ["#005BAA", "#2E6EBE", "#4C89CF", "#7FB1E3", "#A7CCED", "#C7E0F6"];
const ORANGE = "#FF8A00";

// 👇 Updated type with category_name support
type ProductSummaryWithDate = ProductSummary & {
  month: number;
  year: number;
  category_name: string;
};

// Format number to short K/M/B
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
        setSelectedYear(years[years.length - 1]); // default latest year
      })
      .catch(() => setAvailableYears([]));
  }, []);

  // Fetch product summary including category
  useEffect(() => {
    if (!selectedYear) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await getProductTargetSummary(selectedYear);

        const mapped: ProductSummaryWithDate[] = result.map((item) => ({
          ...item,
          month: Number(item.month),
          year: Number(item.year),
          total_nominal: Number(item.total_nominal || 0),
          category_name: item.category_name || "Uncategorized",
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

  // Reset filters
  const clearFilters = () => {
    setFromMonth("all");
    setToMonth("all");
    if (availableYears.length > 0) {
      setSelectedYear(availableYears[availableYears.length - 1]);
    }
  };

  // Filter by month range
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      if (fromMonth === "all" || toMonth === "all") return true;
      return item.month >= fromMonth && item.month <= toMonth;
    });
  }, [data, fromMonth, toMonth]);

  // Sum totals per product
  const aggregatedData = useMemo(() => {
    const map = new Map<
      string,
      { name: string; value: number; category_name: string }
    >();

    filteredData.forEach((item) => {
      if (!map.has(item.product_name)) {
        map.set(item.product_name, {
          name: item.product_name,
          value: 0,
          category_name: item.category_name,
        });
      }

      const entry = map.get(item.product_name)!;
      entry.value += item.total_nominal;
    });

    return Array.from(map.values());
  }, [filteredData]);

  // Group by category
  const chartsByCategory = useMemo(() => {
    const grouped = new Map<string, typeof aggregatedData>();

    aggregatedData.forEach((item) => {
      const category = item.category_name || "Uncategorized";
      if (!grouped.has(category)) grouped.set(category, []);
      grouped.get(category)!.push(item);
    });

    return grouped;
  }, [aggregatedData]);

  if (loading) return <p>Loading product chart...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div>
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="text-2xl font-semibold mb-4 text-[#005BAA]">
          📊 Product Target Distribution
        </h2>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 text-sm w-full">

          {/* Year + Month filters */}
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
                  {getMonthName(m)}
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
                  {getMonthName(m)}
                </option>
              ))}
            </select>
          </div>

          {/* Reset button */}
          <button
            onClick={clearFilters}
            title="Clear Filters"
            className="p-2 rounded-full border border-[#005BAA] text-[#005BAA] hover:bg-[#005BAA] hover:text-white transition"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Render one chart per category */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {Array.from(chartsByCategory.entries()).map(([category, items]) => {
    const highestValue = Math.max(...items.map((d) => d.value));
    const highestName = items.find((d) => d.value === highestValue)?.name;

    return (
      <div
        key={category}
        className="bg-white border border-gray-200 p-6 rounded-xl shadow hover:shadow-lg transition"
      >
        <div className="flex items-center mb-4">
          <div className="w-2 h-6 rounded bg-[#005BAA] mr-3"></div>
          <h3 className="text-xl font-semibold text-[#005BAA]">
            📦 {category} Category
          </h3>
        </div>

        <ResponsiveContainer width="100%" height={360}>
          <PieChart>
<Pie
  data={items}
  dataKey="value"
  nameKey="name"
  cx="50%"
  cy="50%"
  outerRadius={140}
  fontSize={10}
  minAngle={8}  // ⭐ NEW: ensures small products still visible
  label={({ name, value }) => `${name}: ${formatShort(value as number)}`}
>
  {items.map((entry, i) => (
    <Cell
      key={i}
      fill={
        entry.name === highestName
          ? ORANGE
          : BLUE_COLORS[i % BLUE_COLORS.length]
      }
    />
  ))}
</Pie>

            <Tooltip
              formatter={(value: unknown) =>
                `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`
              }
            />

            <Legend
              wrapperStyle={{ fontSize: 12 }}
              formatter={(value: string) => {
                const item = items.find((d) => d.name === value);
                return `${value} – Rp ${(item?.value ?? 0).toLocaleString("id-ID")}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  })}
</div>
    </div>
  );
};

export default ProductTargetChart;
