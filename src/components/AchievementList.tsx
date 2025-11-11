import React, { useEffect, useMemo, useState } from "react";
import type { Achievement } from "../types/achievement";
import { getAllAchievements } from "../services/achievementService";
import getMonthName from "../helper/month";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Props {
  refreshTrigger: number;
}

const AchievementList: React.FC<Props> = ({ refreshTrigger }) => {
  // Data + status
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<"all" | "AO" | "FO">("all");

  // Filters
  const [search, setSearch] = useState("");
  const [fromYear, setFromYear] = useState<number | "all">("all");
  const [fromMonth, setFromMonth] = useState<number | "all">("all");
  const [toYear, setToYear] = useState<number | "all">("all");
  const [toMonth, setToMonth] = useState<number | "all">("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "achieved" | "not">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Fetch achievements
  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllAchievements();
      setAchievements(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to fetch achievements");
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, [refreshTrigger]);

  // Filter options
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          achievements
            .map((a) => a.target?.year)
            .filter((y): y is number => typeof y === "number")
        )
      ).sort((a, b) => b - a),
    [achievements]
  );

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const employees = useMemo(
    () =>
      Array.from(
        new Set(
          achievements
            .map((a) => a.target?.employee?.name)
            .filter((n): n is string => Boolean(n))
        )
      ),
    [achievements]
  );

  const products = useMemo(
    () =>
      Array.from(
        new Set(
          achievements
            .map((a) => a.target?.Product?.name)
            .filter((n): n is string => Boolean(n))
        )
      ),
    [achievements]
  );

  // Tab counts
  const countAll = achievements.length;
  const countAO = achievements.filter((a) => a.target?.employee?.position === "AO").length;
  const countFO = achievements.filter((a) => a.target?.employee?.position === "FO").length;

  // Clear all filters
  const clearFilters = () => {
    setSearch("");
    setFromYear("all");
    setFromMonth("all");
    setToYear("all");
    setToMonth("all");
    setFilterEmployee("all");
    setFilterProduct("all");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  // Tab switch → reset filters
  const handleTabClick = (tab: "all" | "AO" | "FO") => {
    setActiveTab(tab);
    clearFilters();
  };

  // Apply Filters
  const filteredAchievements = useMemo(() => {
    return achievements.filter((a) => {
      const empPos = a.target?.employee?.position;
      const targetNom = a.target?.nominal ?? 0;
      const achieved = a.nominal >= targetNom;

      const matchesTab = activeTab === "all" ? true : empPos === activeTab;

      const matchesSearch =
        a.target?.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.target?.Product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(a.target?.year ?? "").includes(search) ||
        getMonthName(a.target?.month ?? 0).toLowerCase().includes(search.toLowerCase());

      // Date range
      let matchesDateRange = true;
      if (a.target?.year && a.target?.month) {
        const targetDate = new Date(a.target.year, a.target.month - 1);

        if (fromYear !== "all" && fromMonth !== "all") {
          const fromDate = new Date(fromYear, fromMonth - 1);
          matchesDateRange = targetDate >= fromDate;
        }

        if (toYear !== "all" && toMonth !== "all") {
          const toDate = new Date(toYear, toMonth - 1);
          matchesDateRange = matchesDateRange && targetDate <= toDate;
        }
      }

      const matchesEmployee =
        filterEmployee === "all" ? true : a.target?.employee?.name === filterEmployee;
      const matchesProduct =
        filterProduct === "all" ? true : a.target?.Product?.name === filterProduct;
      const matchesStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "achieved"
          ? achieved
          : !achieved;

      return (
        matchesTab &&
        matchesSearch &&
        matchesDateRange &&
        matchesEmployee &&
        matchesProduct &&
        matchesStatus
      );
    });
  }, [
    achievements,
    activeTab,
    search,
    fromYear,
    fromMonth,
    toYear,
    toMonth,
    filterEmployee,
    filterProduct,
    filterStatus,
  ]);

  // Pagination
  const totalPages = Math.ceil(filteredAchievements.length / pageSize);
  const paginatedAchievements = filteredAchievements.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // UI
  if (loading) return <p>Loading achievements...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {[
          { key: "all", label: `All (${countAll})` },
          { key: "AO", label: `AO (${countAO})` },
          { key: "FO", label: `FO (${countFO})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabClick(tab.key as "all" | "AO" | "FO")}
            className={`px-4 py-2 rounded-lg border text-sm transition
              ${
                activeTab === (tab.key as "all" | "AO" | "FO")
                  ? "bg-[#005BAA] text-white border-[#005BAA]"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-[#f3e9fa]"
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold">🏆 All Achievements</h2>

        <input
          type="text"
          placeholder="Search employee, product, year, or month..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
          className="border rounded-lg px-3 py-2 w-full md:w-64 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 text-sm">
        {/* Date range filter */}
        <div className="flex flex-wrap gap-2 items-center">
          <span className="font-medium">From:</span>
          <select
            value={fromMonth}
            onChange={(e) => setFromMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Month</option>
            {months.map((m) => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
          <select
            value={fromYear}
            onChange={(e) => setFromYear(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <span className="mx-2 font-medium">→</span>

          <span className="font-medium">To:</span>
          <select
            value={toMonth}
            onChange={(e) => setToMonth(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Month</option>
            {months.map((m) => (
              <option key={m} value={m}>{getMonthName(m)}</option>
            ))}
          </select>
          <select
            value={toYear}
            onChange={(e) => setToYear(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">Year</option>
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {/* Other Filters + Clear Button */}
        <div className="flex flex-wrap gap-2 items-center">
          <select
            value={filterEmployee}
            onChange={(e) => {
              setFilterEmployee(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp} value={emp}>{emp}</option>
            ))}
          </select>

          <select
            value={filterProduct}
            onChange={(e) => {
              setFilterProduct(e.target.value);
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Products</option>
            {products.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value as "all" | "achieved" | "not");
              setCurrentPage(1);
            }}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="achieved">Achieved</option>
            <option value="not">Not Achieved</option>
          </select>

          <button
            onClick={clearFilters}
            className="px-3 py-2 rounded-lg text-sm border border-[#005BAA] text-[#005BAA] hover:bg-[#005BAA] hover:text-white transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-center">Month</th>
              <th className="px-4 py-2 text-center">Year</th>
              <th className="px-4 py-2 text-right">Target Nominal</th>
              <th className="px-4 py-2 text-right">Achiev Nominal</th>
              <th className="px-4 py-2 text-center">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAchievements.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4 text-gray-500 italic">
                  No matching records found
                </td>
              </tr>
            ) : (
              paginatedAchievements.map((a) => {
                const targetNom = a.target?.nominal ?? 0;
                const achieved = a.nominal >= targetNom;

                return (
                  <tr key={a.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{a.target?.employee?.name || "—"}</td>
                    <td className="px-4 py-2">{a.target?.employee?.position || "—"}</td>
                    <td className="px-4 py-2">{a.target?.Product?.name || "—"}</td>
                    <td className="px-4 py-2 text-center">
                      {a.target?.month ? getMonthName(a.target.month) : "—"}
                    </td>
                    <td className="px-4 py-2 text-center">{a.target?.year ?? "—"}</td>
                    <td className="px-4 py-2 text-right">
                      {a.target?.nominal !== undefined
                        ? `Rp ${a.target.nominal.toLocaleString("id-ID")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      Rp {a.nominal.toLocaleString("id-ID")}
                    </td>

                    <td className="px-4 py-2 text-center">
                      {achieved ? (
                        <span className="flex items-center justify-center gap-1 text-green-600 font-medium">
                          <ThumbsUp size={16} /> Achieved
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1 text-red-600 font-medium">
                          <ThumbsDown size={16} /> Not Achieved
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4 text-sm">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Previous
          </button>

          <span>
            Page <strong>{currentPage}</strong> of {totalPages}
          </span>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded-lg hover:bg-gray-100 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AchievementList;
