import React, { useEffect, useState } from "react";
import { getProductTargetSummary, getAvailableYears } from "../services/analyticsService";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ProductSummary } from "../types/analytics";

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#7c3aed", "#0ea5e9"];

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
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch product data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedYear]);

  if (loading) return <p>Loading product chart...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">🟢 Product Target Distribution</h2>

      {/* ✅ Year Dropdown */}
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

      {data.length === 0 ? (
        <p className="text-gray-500">No data available.</p>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data.map((d) => ({
                name: d.product_name,
                value: d.total_nominal,
              }))}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              fontSize={8}
              outerRadius={150}
              fill="#8884d8"
              label={({ name, value }) =>
                `${name}: Rp ${Number(value).toLocaleString("id-ID")}`
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: unknown) =>
                `Rp ${Number(value ?? 0).toLocaleString("id-ID")}`
              }
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ProductTargetChart;
