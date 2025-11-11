import React, { useEffect, useMemo, useState } from "react";
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
import getMonthName from "../helper/month";
import type { Target } from "../types/target";
import { motion } from "framer-motion";

interface Props {
  employeeId: string;
  employeeName: string;
  employeePosition: string;
  entryDate: string;
  filteredTargets: Target[];
}

interface ChartDataPoint {
  month: number;
  target: number;
  achievement: number;
  percentage: number;
}

// ✅ Custom Tooltip
interface FixedTooltipProps extends TooltipProps<ValueType, NameType> {
  payload?: { dataKey: string; value: number }[];
  label?: string | number;
}

const CustomTooltip: React.FC<FixedTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || payload.length === 0) return null;

  const target = payload.find((p) => p.dataKey === "target")?.value ?? 0;
  const achievement = payload.find((p) => p.dataKey === "achievement")?.value ?? 0;
  const percentage = target > 0 ? ((achievement / target) * 100).toFixed(2) : "0.00";
  const monthName = getMonthName(Number(label));

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
  filteredTargets,
  employeeName,
}) => {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // 🧮 Aggregate data by month
  const aggregatedData = useMemo(() => {
    const monthMap = new Map<number, { target: number; achievement: number }>();

    filteredTargets.forEach((t) => {
      const month = t.month;
      const existing = monthMap.get(month) || { target: 0, achievement: 0 };
      monthMap.set(month, {
        target: existing.target + (t.nominal ?? 0),
        achievement:
          existing.achievement + (t.Achievement?.nominal ?? 0),
      });
    });

    return Array.from(monthMap.entries())
      .map(([month, { target, achievement }]) => ({
        month,
        target,
        achievement,
        percentage: target > 0 ? (achievement / target) * 100 : 0,
      }))
      .sort((a, b) => a.month - b.month);
  }, [filteredTargets]);

  // 🌀 Animate transitions
  useEffect(() => {
    setChartData(aggregatedData);
  }, [aggregatedData]);

  return (
    <motion.div
      className="p-4 sm:p-8 bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          📈 {employeeName}'s Performance Chart
        </h2>

        {chartData.length > 0 ? (
          <motion.div
            key={chartData.map((d) => `${d.month}-${d.target}`).join(",")}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="chart-container bg-white rounded-lg p-2"
          >
            <ResponsiveContainer width="100%" height={360}>
              <LineChart data={chartData}>
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
                  isAnimationActive={true}
                  animationDuration={800}
                />
                <Line
                  type="monotone"
                  dataKey="achievement"
                  stroke="#F48B28"
                  strokeWidth={2.5}
                  name="Achievement"
                  dot={{ r: 3 }}
                  isAnimationActive={true}
                  animationDuration={800}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        ) : (
          <p className="text-gray-500 text-sm">No data available for current filters.</p>
        )}
      </div>
    </motion.div>
  );
};

export default EmployeeChartForDetail;
