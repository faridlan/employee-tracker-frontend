import React, { useEffect, useMemo, useState } from "react";
import type { Target } from "../types/target";
import { getAllTargets, deleteTarget } from "../services/targetService";
import getMonthName from "../helper/month";
import UpdateTargetModal from "./UpdateTargetModal";

interface Props {
  refreshTrigger: number;
}

const TargetList: React.FC<Props> = ({ refreshTrigger }) => {
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);

  const openEditModal = (target: Target) => {
    setSelectedTarget(target);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this target?")) return;

    try {
      await deleteTarget(id);
      setTargets((prev) => prev.filter((t) => t.id !== id)); // remove instantly
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
      else alert("Failed to delete target");
    }
  };

  // ✅ Fetch Targets
  useEffect(() => {
    const fetchTargets = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getAllTargets();
        if (Array.isArray(data)) setTargets(data);
        else setTargets([]);
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch targets");
      } finally {
        setLoading(false);
      }
    };
    fetchTargets();
  }, [refreshTrigger]);

  // ✅ Filters
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterEmployee, setFilterEmployee] = useState<string>("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");

  const years = useMemo(
    () => Array.from(new Set(targets.map((t) => t.year))).sort((a, b) => b - a),
    [targets]
  );
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const employees = useMemo(
    () =>
      Array.from(
        new Set(
          targets.map((t) => t.employee?.name).filter((n): n is string => Boolean(n))
        )
      ),
    [targets]
  );

  const products = useMemo(
    () =>
      Array.from(
        new Set(
          targets.map((t) => t.Product?.name).filter((n): n is string => Boolean(n))
        )
      ),
    [targets]
  );

  // ✅ Apply filters + search
  const filteredTargets = useMemo(() => {
    return targets.filter((t) => {
      const matchesSearch =
        t.employee?.name?.toLowerCase().includes(search.toLowerCase()) ||
        t.Product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(t.year).includes(search) ||
        String(t.month).includes(search);

      const matchesYear = filterYear === "all" ? true : t.year === filterYear;
      const matchesMonth = filterMonth === "all" ? true : t.month === filterMonth;
      const matchesEmployee =
        filterEmployee === "all" ? true : t.employee?.name === filterEmployee;
      const matchesProduct =
        filterProduct === "all" ? true : t.Product?.name === filterProduct;

      return (
        matchesSearch &&
        matchesYear &&
        matchesMonth &&
        matchesEmployee &&
        matchesProduct
      );
    });
  }, [targets, search, filterYear, filterMonth, filterEmployee, filterProduct]);

  // ✅ Pagination logic
  const pageSize = 8;
  const totalPages = Math.ceil(filteredTargets.length / pageSize);
  const [currentPage, setCurrentPage] = useState(1);
  const paginatedTargets = filteredTargets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ UI Rendering
  if (loading) return <p>Loading targets...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold">🎯 All Targets</h2>

        <input
          type="text"
          placeholder="Search employee, product, year..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full md:w-64 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
        <select
          value={filterYear}
          onChange={(e) =>
            setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Years</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <select
          value={filterMonth}
          onChange={(e) =>
            setFilterMonth(e.target.value === "all" ? "all" : Number(e.target.value))
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Months</option>
          {months.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>

        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Employees</option>
          {employees.map((emp) => (
            <option key={emp} value={emp}>
              {emp}
            </option>
          ))}
        </select>

        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Products</option>
          {products.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Employee</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Product</th>
              <th className="px-4 py-2 text-right">Target</th>
              <th className="px-4 py-2 text-center">Month</th>
              <th className="px-4 py-2 text-center">Year</th>
              <th className="px-4 py-2 text-right">Achievement</th>
              <th className="px-4 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTargets.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                  No matching records found
                </td>
              </tr>
            ) : (
              paginatedTargets.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{t.employee?.name || "—"}</td>
                  <td className="px-4 py-2">{t.employee?.position || "—"}</td>
                  <td className="px-4 py-2">{t.Product?.name || "—"}</td>
                  <td className="px-4 py-2 text-right">
                    Rp {t.nominal.toLocaleString("id-ID")}
                  </td>
                  <td className="px-4 py-2 text-center">{getMonthName(t.month)}</td>
                  <td className="px-4 py-2 text-center">{t.year}</td>
                  <td className="px-4 py-2 text-right">
                    {t.Achievement
                      ? `Rp ${t.Achievement.nominal.toLocaleString("id-ID")}`
                      : "—"}
                  </td>
                  <td className="px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => openEditModal(t)}
                      className="px-2 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
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

      {/* Edit Modal */}
      {showEditModal && selectedTarget && (
        <UpdateTargetModal
          target={selectedTarget}
          onClose={() => setShowEditModal(false)}
          onUpdated={() => {
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
};

export default TargetList;
