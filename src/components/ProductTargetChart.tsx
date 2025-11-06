import React, { useEffect, useState } from "react";
import { getProductTargetSummary, getAvailableYears } from "../services/analyticsService";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { ProductSummary } from "../types/analytics";

// 🟣 Bank Galuh Brand Colors (A2 Harmonized Palette)
const COLORS = [
  "#815aa5", // Primary Purple
  "#9d7fc2", // Light Purple
  "#F48B28", // Accent Orange
  "#bba7d6", // Soft Lilac
  "#d8c8e8", // Pastel Lavender
  "#f0e8f7", // Blush Purple
];

// Format number to short K/M/B format
const formatShort = (num: number): string => {
  if (num >= 1_000_000_000) return `Rp ${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `Rp ${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `Rp ${(num / 1_000).toFixed(1)}K`;
  return `Rp ${num.toLocaleString("id-ID")}`;
};

const ProductTargetChart: React.FC = () => {
  const [data, setData] = useState<ProductSummary[]>([]);
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
        const result = await getProductTargetSummary(selectedYear);
        setData(
          result.map((item) => ({
            ...item,
            total_nominal: Number(item.total_nominal || 0),
          }))
        );
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) return <p>Loading product chart...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  const formattedData = data.map((d) => ({
    name: d.product_name,
    value: d.total_nominal,
  }));

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4 text-[#815aa5]">
        📊 Product Target Distribution
      </h2>

      {/* Year Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <label className="text-sm font-medium">Select Year:</label>
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

      {formattedData.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={420}>
          <PieChart>
            <Pie
              data={formattedData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              fontSize={8}
              outerRadius={140}
              labelLine
              label={({ name, value }) =>
                `${name}: ${formatShort(value as number)}`
              }
            >
              {formattedData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip
              formatter={(value: unknown) =>
                `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`
              }
            />

            <Legend
              formatter={(value: string) => {
                const item = formattedData.find((d) => d.name === value);
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
