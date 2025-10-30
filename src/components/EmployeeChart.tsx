import React, { useEffect, useState } from "react";
import { getAllEmployees } from "../services/employeeService";
import { getEmployeePerformance, getAvailableYears } from "../services/analyticsService";
import type { Employee } from "../types/employee";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { EmployeePerformance } from "../types/analytics";

const EmployeeChart: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [data, setData] = useState<EmployeePerformance[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🧩 Load employees and years on mount
  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(() => setEmployees([]));
    getAvailableYears()
      .then((years) => {
        setAvailableYears(years);
        setSelectedYear(years[years.length - 1]); // default: latest year
      })
      .catch(() => setAvailableYears([]));
  }, []);

  // 🧩 Fetch performance data when employee/year changes
  useEffect(() => {
    if (!selectedEmployee || !selectedYear) return;

    const fetchPerformance = async () => {
      setLoading(true);
      setError(null);
      try {
        const perf = await getEmployeePerformance(selectedEmployee, selectedYear);
        setData(perf);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch performance data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformance();
  }, [selectedEmployee, selectedYear]);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-4">📈 Employee Performance Overview</h2>

      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mb-4">
        <label className="text-sm font-medium">Employee:</label>
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="border rounded-lg px-3 py-2 mt-2 sm:mt-0"
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.office_location})
            </option>
          ))}
        </select>

        {/* ✅ Year Selector */}
        <label className="text-sm font-medium sm:ml-4">Year:</label>
        <select
          value={selectedYear ?? ""}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 mt-2 sm:mt-0"
          disabled={availableYears.length === 0}
        >
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-gray-500">Loading chart...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {!loading && !error && data.length > 0 && (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis
              tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID")}`}
              tick={{ fontSize: 12, fill: "#4b5563" }}
              width={100}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const target = payload.find((p) => p.dataKey === "target");
                  const achievement = payload.find(
                    (p) => p.dataKey === "achievement"
                  );
                  const percentage =
                    achievement && target
                      ? ((Number(achievement.value) / Number(target.value)) * 100) || 0
                      : 0;
                  return (
                    <div className="bg-white border border-gray-300 rounded-lg p-3 shadow text-sm">
                      <p className="font-semibold mb-1">{label}</p>
                      <p>🎯 Target: Rp {Number(target?.value).toLocaleString("id-ID")}</p>
                      <p>🏆 Achievement: Rp {Number(achievement?.value).toLocaleString("id-ID")}</p>
                      <p className={`font-semibold ${percentage >= 100 ? "text-green-600" : "text-blue-600"}`}>
                        📊 Achievement Rate: {percentage.toFixed(2)}%
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="target" stroke="#2563eb" strokeWidth={2} name="Target" />
            <Line type="monotone" dataKey="achievement" stroke="#16a34a" strokeWidth={2} name="Achievement" />
          </LineChart>
        </ResponsiveContainer>
      )}

      {!loading && !error && selectedEmployee && data.length === 0 && (
        <p className="text-gray-500">No performance data found.</p>
      )}
    </div>
  );
};

export default EmployeeChart;
