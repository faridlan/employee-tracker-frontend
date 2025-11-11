import React, { useEffect, useRef, useState } from "react";
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
import type { TooltipProps } from "recharts";
import type { ValueType, NameType } from "recharts/types/component/DefaultTooltipContent";
import { getEmployeePerformance, getAvailableYears } from "../services/analyticsService";
import getMonthName from "../helper/month";
import type { EmployeePerformance } from "../types/analytics";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  entryDate: string;
}

interface ChartDataPoint {
  month: number;
  year: number;
  target: number;
  achievement: number;
  percentage?: number;
}

// ✅ Fix for Recharts Tooltip typing gaps
interface FixedTooltipProps extends TooltipProps<ValueType, NameType> {
  payload?: { dataKey: string; value: number }[];
  label?: string | number;
}

// ✅ Strongly Typed Custom Tooltip
const CustomTooltip: React.FC<FixedTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const achievement = payload.find((p) => p.dataKey === "achievement")?.value ?? 0;
  const percentage = target > 0 ? ((achievement / target) * 100).toFixed(2) : "0.00";

  const monthName =
    [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December",
    ][Number(label) - 1];

  const diff = achievement - target;
  const diffColor = diff >= 0 ? "#16a34a" : "#dc2626";
  const diffSymbol = diff >= 0 ? "↑" : "↓";

  return (
    <div
      style={{
        background: "white",
        padding: "10px 14px",
        borderRadius: 8,
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        minWidth: 180,
      }}
    >
      <p style={{ margin: 0, fontWeight: 600, color: "#374151" }}>{monthName}</p>
      <p style={{ margin: "4px 0 0", fontSize: 13 }}>
        🎯 Target: <strong>Rp {Number(target).toLocaleString("id-ID")}</strong>
      </p>
      <p style={{ margin: 0, fontSize: 13 }}>
        🏆 Achievement: <strong>Rp {Number(achievement).toLocaleString("id-ID")}</strong>
      </p>
      <p style={{ margin: "4px 0 0", fontSize: 13 }}>
        📊 Achievement Rate: <strong>{percentage}%</strong>
      </p>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: diffColor }}>
        {diffSymbol} Rp {Math.abs(diff).toLocaleString("id-ID")}
      </p>
    </div>
  );
};

const EmployeeChartForDetail: React.FC<Props> = ({
  employeeId,
  employeeName,
  employeePosition,
  entryDate,
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const COMPANY_NAME = "Perumda Galuh Ciamis";

  // 🧩 Load available years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const years = await getAvailableYears();
        setAvailableYears(years);
        setSelectedYear(years[years.length - 1]);
      } catch {
        setAvailableYears([]);
      }
    };
    fetchYears();
  }, []);

  // 🧩 Load performance data
  useEffect(() => {
    if (!employeeId || !selectedYear) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const result: EmployeePerformance[] = await getEmployeePerformance(employeeId, selectedYear);
        const normalized: ChartDataPoint[] = result.map((r) => {
          const monthStr = String(r.month);
          const monthNumber = monthStr.includes("-")
            ? Number(monthStr.split("-")[1])
            : Number(monthStr);

          const target = r.target ?? 0;
          const achievement = r.achievement ?? 0;
          const percentage = target > 0 ? (achievement / target) * 100 : 0;

          return { month: monthNumber, year: r.year, target, achievement, percentage };
        });

        normalized.sort((a, b) => a.month - b.month);
        setData(normalized);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch performance data");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId, selectedYear]);

  // 📸 Export as PNG or PDF
  const handleDownloadChart = async (type: "png" | "pdf") => {
    if (!chartRef.current) return;

    try {
      const node = chartRef.current;
      const scale = 2;

      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale,
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const fileName = `employee_performance_${employeeId}_${selectedYear}_${Date.now()}`;

      if (type === "png") {
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${fileName}.png`;
        link.click();
      } else {
        const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 60;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // 🏢 Header
        pdf.setFont("helvetica", "bold");
        pdf.setFontSize(20);
        pdf.text(COMPANY_NAME, 30, 40);

        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(14);
        pdf.text(`Employee Performance Report (${selectedYear})`, 30, 65);

        // Employee info
        pdf.setFontSize(12);
        const infoStartY = 95;
        pdf.text(`Name: ${employeeName}`, 30, infoStartY);
        pdf.text(`Position: ${employeePosition}`, 30, infoStartY + 18);
        pdf.text(
          `Entry Date: ${new Date(entryDate).toLocaleDateString("id-ID")}`,
          30,
          infoStartY + 36
        );

        const infoBottomY = infoStartY + 50;
        pdf.addImage(imgData, "PNG", 30, infoBottomY + 20, imgWidth, imgHeight);
        pdf.save(`${fileName}.pdf`);
      }
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  return (
    <div className="p-4 sm:p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Employee Performance Dashboard
      </h1>

      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-3 sm:mb-0">
            📈 Performance Chart
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
                Year:
              </label>
              <select
                value={selectedYear ?? ""}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                disabled={availableYears.length === 0 || loading}
              >
                {availableYears.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => handleDownloadChart("png")}
              disabled={loading || data.length === 0}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm disabled:opacity-50"
            >
              📤 PNG
            </button>

            <button
              onClick={() => handleDownloadChart("pdf")}
              disabled={loading || data.length === 0}
              className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg text-sm disabled:opacity-50"
            >
              🧾 PDF
            </button>
          </div>
        </div>

        {/* Chart */}
        {!loading && !error && data.length > 0 && (
          <div ref={chartRef} className="chart-container bg-white rounded-lg p-2">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(m) => getMonthName(Number(m)).substring(0, 3)}
                  tick={{ fontSize: 13, fill: "#374151", fontWeight: 500 }}
                />
                <YAxis
                  tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID")}`}
                  tick={{ fontSize: 13, fill: "#374151", fontWeight: 500 }}
                  width={110}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 13 }} />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#005BAA"
                  strokeWidth={2.5}
                  name="Target"
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="achievement"
                  stroke="#F48B28"
                  strokeWidth={2.5}
                  name="Achievement"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeChartForDetail;
