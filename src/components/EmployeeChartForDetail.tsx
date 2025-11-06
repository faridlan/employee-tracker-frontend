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
import { getEmployeePerformance, getAvailableYears } from "../services/analyticsService";
import getMonthName from "../helper/month";
import type { EmployeePerformance } from "../types/analytics";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface Props {
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  entryDate: string,
}

interface ChartDataPoint {
  month: number;
  year: number;
  target: number;
  achievement: number;
  percentage?: number;
}

const EmployeeChartForDetail: React.FC<Props> = ({   employeeId,
  employeeName,
  employeePosition,
  entryDate, }) => {
  const chartRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const COMPANY_NAME = "Nexira Sales Corp";

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
const normalized = result.map((r) => {
  const monthStr = String(r.month);
  const monthNumber = monthStr.includes("-")
    ? Number(monthStr.split("-")[1])
    : Number(monthStr);

  return {
    month: monthNumber,
    year: r.year,
    target: r.target,
    achievement: r.achievement,
  };
}) as ChartDataPoint[];
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

  // 📸 Export as PNG or PDF with simple header
  const handleDownloadChart = async (type: "png" | "pdf") => {
    if (!chartRef.current) {
      console.error("Chart reference not found.");
      return;
    }

    try {
      const node = chartRef.current;
      const scale = 2;

      const canvas = await html2canvas(node, {
        backgroundColor: "#ffffff",
        scale,
        useCORS: true,
        logging: false,
        foreignObjectRendering: false,
      });

      const imgData = canvas.toDataURL("image/png");
      const fileName = `employee_performance_${employeeId}_${selectedYear}_${Date.now()}`;

      if (type === "png") {
        const link = document.createElement("a");
        link.href = imgData;
        link.download = `${fileName}.png`;
        link.click();
      } else {
        const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pageWidth - 60;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // ===== 🏢 Company & Report Header =====
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.text(COMPANY_NAME, 30, 40);

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(14);
  pdf.text(`Employee Performance Report (${selectedYear})`, 30, 65);

  // --- Divider ---
  pdf.setDrawColor(180, 180, 180);
  pdf.setLineWidth(1);
  pdf.line(30, 75, pageWidth - 30, 75);

  // ===== 🧑‍💼 Employee Information =====
  pdf.setFontSize(12);
  const infoStartY = 95;
  pdf.text(`Name: ${employeeName}`, 30, infoStartY);
  pdf.text(`Position: ${employeePosition}`, 30, infoStartY + 18);
  pdf.text(
    `Entry Date: ${new Date(entryDate).toLocaleDateString("id-ID")}`,
    30,
    infoStartY + 36
  );

  // --- Divider ---
  const infoBottomY = infoStartY + 50;
  pdf.setDrawColor(200, 200, 200);
  pdf.setLineWidth(0.8);
  pdf.line(30, infoBottomY, pageWidth - 30, infoBottomY);

  // ===== 📊 Chart Image =====
  const chartYStart = infoBottomY + 20;
  pdf.addImage(imgData, "PNG", 30, chartYStart, imgWidth, imgHeight);

  // ===== 📝 PAGE 2: Employee Targets Table =====
  pdf.addPage();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(16);
  pdf.text("Employee Targets Overview", 30, 40);

  const headers = ["Month", "Year", "Target", "Achieve", "%"];
  const colWidths = [90, 60, 130, 130, 60];
  const startX = 30;
  let y = 70;

  // Table Header
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  let x = startX;
  headers.forEach((h, i) => {
    pdf.text(h, x, y);
    x += colWidths[i];
  });

  // Draw line under header
  y += 8;
  pdf.setDrawColor(0);
  pdf.setLineWidth(0.5);
  pdf.line(startX, y, startX + colWidths.reduce((a, b) => a + b), y);

  // Table Rows
  pdf.setFont("helvetica", "normal");
  y += 20;

  const rowHeight = 24;

  data.forEach((row) => {
    if (y > pageHeight - 60) {
      pdf.addPage();
      y = 60; // reset Y for new page
    }

    const achievement = row.achievement || 0;
    const percent = row.target ? ((achievement / row.target) * 100).toFixed(1) : "-";

    let xRow = startX;
    pdf.text(getMonthName(row.month), xRow, y);
    xRow += colWidths[0];

    pdf.text(String(row.year), xRow, y);
    xRow += colWidths[1];

    pdf.text(`Rp ${row.target.toLocaleString("id-ID")}`, xRow, y);
    xRow += colWidths[2];

    pdf.text(`Rp ${achievement.toLocaleString("id-ID")}`, xRow, y);
    xRow += colWidths[3];

    pdf.text(`${percent}%`, xRow, y);

    // Row separator
    y += rowHeight;
    pdf.setDrawColor(220, 220, 220);
    pdf.setLineWidth(0.4);
    pdf.line(startX, y - 16, startX + colWidths.reduce((a, b) => a + b), y - 16);
  });

  // Footer Timestamp
  pdf.setFont("helvetica", "italic");
  pdf.setFontSize(10);
  pdf.setTextColor("#555");
  const generatedAt = new Date().toLocaleString("id-ID");
  pdf.text(`Generated on: ${generatedAt}`, pageWidth - 30, pageHeight - 20, {
    align: "right",
  });

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
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                disabled={availableYears.length === 0 || loading}
              >
                <option value="" disabled>
                  Select Year
                </option>
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
              className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              📤 PNG
            </button>

            <button
              onClick={() => handleDownloadChart("pdf")}
              disabled={loading || data.length === 0}
              className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-3 rounded-lg text-sm transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              🧾 PDF
            </button>
          </div>
        </div>

        {/* Chart Section */}
        {loading && (
          <div className="flex items-center justify-center h-96">
            <p className="text-xl text-blue-500 animate-pulse">
              Loading performance chart...
            </p>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-96">
            <p className="text-red-600 text-xl font-medium">Error: {error}</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <div
            ref={chartRef}
            className="chart-container bg-white rounded-lg p-2"
            style={{ marginBottom: "0.5rem" }}
          >
            <ResponsiveContainer width="100%" height={360}>
              <LineChart
                data={data}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="month"
                  tickFormatter={(m) => getMonthName(Number(m)).substring(0, 3)}
                  tick={{ fontSize: 13, fill: "#374151", fontWeight: 500 }}
                  tickMargin={8}
                  axisLine={{ stroke: "#9ca3af" }}
                  tickLine={{ stroke: "#9ca3af" }}
                />
                <YAxis
                  tickFormatter={(v) => `Rp ${Number(v).toLocaleString("id-ID")}`}
                  tick={{ fontSize: 13, fill: "#374151", fontWeight: 500 }}
                  width={110}
                  tickMargin={6}
                  axisLine={{ stroke: "#9ca3af" }}
                  tickLine={{ stroke: "#9ca3af" }}
                />
                <Tooltip
                  labelFormatter={(label) =>
    [
      "January","February","March","April","May","June",
      "July","August","September","October","November","December"
    ][label - 1]
  } />
                <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: 13 }} />
<Line
  type="monotone"
  dataKey="target"
  stroke="#815aa5"
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