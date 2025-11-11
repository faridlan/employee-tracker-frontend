import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById, deleteEmployee } from "../services/employeeService";
import { deleteTarget } from "../services/targetService";
import type { Employee } from "../types/employee";
import type { Target } from "../types/target";
import type { Product } from "../types/product";
import getMonthName from "../helper/month";
import EmployeeChartForDetail from "../components/EmployeeChartForDetail";
import ConfirmDialog from "../components/common/ConfirmDialog";
import EditEmployeeModal from "../components/EditEmployeeModal";
import { useToast } from "../components/ToastProvider";
import { Pencil, Trash, ThumbsUp, ThumbsDown, XCircle } from "lucide-react";
import CombinedEditTargetAchievementModal from "./CombinedEditTargetAchiementModal";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toPng } from "html-to-image";

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<Target | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [fromMonth, setFromMonth] = useState<number | "all">("all");
  const [toMonth, setToMonth] = useState<number | "all">("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [filterAchieved, setFilterAchieved] = useState<"all" | "achieved" | "not-achieved">("all");

  const reportRef = useRef<HTMLDivElement>(null);

  const refetchEmployee = async () => {
    if (!id) return;
    const data = await getEmployeeById(id);
    setEmployee(data);
  };

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        if (!id) return;
        const data = await getEmployeeById(id);
        setEmployee(data);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to fetch employee");
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const years = useMemo(() => {
    if (!employee) return [];
    return Array.from(new Set(employee.targets.map((t) => t.year))).sort((a, b) => b - a);
  }, [employee]);

  const products = useMemo(() => {
    if (!employee) return [];
    const map = new Map<string, Product>();
    for (const t of employee.targets) {
      if (t.Product) map.set(t.Product.id, t.Product);
    }
    return Array.from(map.values());
  }, [employee]);

  // Apply all filters
  const filteredTargets = useMemo(() => {
    if (!employee) return [];
    return employee.targets.filter((t) => {
      const matchesSearch =
        t.Product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(t.year).includes(search) ||
        getMonthName(t.month).toLowerCase().includes(search.toLowerCase());
      const matchesYear = filterYear === "all" || t.year === filterYear;
      const matchesProduct = filterProduct === "all" || t.Product?.id === filterProduct;
      const matchesFrom = fromMonth === "all" || t.month >= (fromMonth as number);
      const matchesTo = toMonth === "all" || t.month <= (toMonth as number);

      const achieved =
        t.Achievement && t.Achievement.nominal >= t.nominal ? "achieved" : "not-achieved";
      const matchesAchieved = filterAchieved === "all" || achieved === filterAchieved;

      return (
        matchesSearch &&
        matchesYear &&
        matchesProduct &&
        matchesFrom &&
        matchesTo &&
        matchesAchieved
      );
    });
  }, [employee, search, filterYear, filterProduct, fromMonth, toMonth, filterAchieved]);

  const clearFilters = () => {
    setFilterYear("all");
    setFromMonth("all");
    setToMonth("all");
    setFilterProduct("all");
    setFilterAchieved("all");
    setSearch("");
  };

  const handleDeleteEmployee = async () => {
    if (!employee) return;
    try {
      setDeleting(true);
      await deleteEmployee(employee.id);
      showToast("Employee deleted ✅", "success");
      navigate("/employees");
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete employee ❌", "error");
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const handleDeleteTarget = async () => {
    if (!confirmDeleteTarget) return;
    try {
      setDeletingTarget(true);
      await deleteTarget(confirmDeleteTarget.id);
      showToast("Target deleted ✅", "success");
      await refetchEmployee();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : "Failed to delete target ❌", "error");
    } finally {
      setDeletingTarget(false);
      setConfirmDeleteTarget(null);
    }
  };

  /** 🧾 Export PDF – uses filters for chart & table */
  const handleExportPDF = async () => {
    if (!employee || !reportRef.current) return;

    try {
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();

      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(20);
      pdf.text("Perumda Galuh Ciamis", 30, 40);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(14);
      pdf.text(`Employee Performance Report`, 30, 65);

      pdf.setFontSize(12);
      pdf.text(`Name: ${employee.name}`, 30, 90);
      pdf.text(`Position: ${employee.position}`, 30, 108);
      pdf.text(
        `Entry Date: ${new Date(employee.entry_date).toLocaleDateString("id-ID")}`,
        30,
        126
      );

      // 🧠 Export the CHART (filtered)
      const chartEl = reportRef.current.querySelector(".chart-container") as HTMLElement;
      if (chartEl) {
        const chartImg = await toPng(chartEl, { cacheBust: true, backgroundColor: "white" });
        const imgWidth = pageWidth - 60;
        const imgHeight = (chartEl.offsetHeight * imgWidth) / chartEl.offsetWidth;
        pdf.addImage(chartImg, "PNG", 30, 150, imgWidth, imgHeight);
      }

      // 🧠 Export TABLE – filtered only
      if (filteredTargets.length > 0) {
        const tableData = filteredTargets.map((t) => [
          getMonthName(t.month),
          t.year,
          t.Product?.name || "—",
          `Rp ${t.nominal.toLocaleString("id-ID")}`,
          t.Achievement
            ? `Rp ${t.Achievement.nominal.toLocaleString("id-ID")}`
            : "—",
          t.Achievement
            ? t.Achievement.nominal >= t.nominal
              ? "✅ Achieved"
              : "❌ Not Achieved"
            : "—",
        ]);

        pdf.addPage();
        autoTable(pdf, {
          head: [["Month", "Year", "Product", "Target", "Achievement", "Status"]],
          body: tableData,
          startY: 50,
          styles: { fontSize: 10, cellPadding: 4 },
          headStyles: { fillColor: [55, 65, 81], textColor: 255 },
        });
      } else {
        pdf.addPage();
        pdf.setFontSize(12);
        pdf.text("No matching records for current filters.", 40, 80);
      }

      pdf.save(`employee_report_${employee.name}.pdf`);
    } catch (error) {
      console.error("Export failed:", error);
      showToast("Failed to export PDF", "error");
    }
  };

  if (loading) return <p className="text-gray-500 p-4">Loading employee...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!employee) return <p className="p-4">Employee not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            🧾 Export PDF
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="px-3 py-2 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
          >
            Edit Employee
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Delete Employee
          </button>
        </div>
      </div>

      {/* Report Content */}
      <div ref={reportRef}>
<EmployeeChartForDetail
  employeeId={employee.id}
  employeeName={employee.name}
  employeePosition={employee.position}
  entryDate={employee.entry_date}
  filteredTargets={filteredTargets}
/>

        {/* Filters + Table */}
        <div className="bg-white p-6 mt-6 rounded-xl shadow">
          <div className="flex flex-wrap items-center gap-3 mb-5 text-sm">
            {/* Year */}
            <div className="flex items-center gap-2">
              <label className="font-medium">Year:</label>
              <select
                value={filterYear}
                onChange={(e) =>
                  setFilterYear(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Month From / To */}
            <div className="flex items-center gap-2">
              <label className="font-medium">From:</label>
              <select
                value={fromMonth}
                onChange={(e) =>
                  setFromMonth(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>

              <label className="font-medium">To:</label>
              <select
                value={toMonth}
                onChange={(e) =>
                  setToMonth(e.target.value === "all" ? "all" : Number(e.target.value))
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>

            {/* Product */}
            <div className="flex items-center gap-2">
              <label className="font-medium">Product:</label>
              <select
                value={filterProduct}
                onChange={(e) => setFilterProduct(e.target.value)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                {products.map((p: Product) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Achieved */}
            <div className="flex items-center gap-2">
              <label className="font-medium">Achieved:</label>
              <select
                value={filterAchieved}
                onChange={(e) =>
                  setFilterAchieved(e.target.value as "all" | "achieved" | "not-achieved")
                }
                className="border rounded-lg px-3 py-2"
              >
                <option value="all">All</option>
                <option value="achieved">Achieved</option>
                <option value="not-achieved">Not Achieved</option>
              </select>
            </div>

            <button
              onClick={clearFilters}
              className="ml-auto p-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition"
              title="Clear Filters"
            >
              <XCircle size={18} />
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Month</th>
                  <th className="px-4 py-2 text-center">Year</th>
                  <th className="px-4 py-2 text-left">Product</th>
                  <th className="px-4 py-2 text-right">Target</th>
                  <th className="px-4 py-2 text-right">Achievement</th>
                  <th className="px-4 py-2 text-center">Status</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTargets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                      No matching records
                    </td>
                  </tr>
                ) : (
                  filteredTargets.map((t) => {
                    const achieved = t.Achievement
                      ? t.Achievement.nominal >= t.nominal
                      : false;
                    return (
                      <tr key={t.id} className="border-t hover:bg-gray-50">
                        <td className="px-4 py-2">{getMonthName(t.month)}</td>
                        <td className="px-4 py-2 text-center">{t.year}</td>
                        <td className="px-4 py-2">{t.Product?.name || "—"}</td>
                        <td className="px-4 py-2 text-right">
                          Rp {t.nominal.toLocaleString("id-ID")}
                        </td>
                        <td className="px-4 py-2 text-right">
                          {t.Achievement
                            ? `Rp ${t.Achievement.nominal.toLocaleString("id-ID")}`
                            : "—"}
                        </td>
                        <td className="px-4 py-2 text-center">
                          {t.Achievement ? (
                            achieved ? (
                              <span className="inline-flex items-center gap-1 text-green-600 font-medium">
                                <ThumbsUp size={16} /> Achieved
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-red-600 font-medium">
                                <ThumbsDown size={16} /> Not Achieved
                              </span>
                            )
                          ) : (
                            <span className="text-gray-500 italic">No Data</span>
                          )}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => {
                              setSelectedTarget(t);
                              setShowEditTargetModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-700 mr-2"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteTarget(t)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && employee && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setShowEditModal(false)}
          onUpdated={refetchEmployee}
        />
      )}

      {showEditTargetModal && selectedTarget && (
        <CombinedEditTargetAchievementModal
          target={selectedTarget}
          onClose={() => setShowEditTargetModal(false)}
          onUpdated={refetchEmployee}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Employee"
          message="Are you sure you want to delete this employee?"
          onConfirm={handleDeleteEmployee}
          onClose={() => setConfirmDelete(false)}
          loading={deleting}
        />
      )}

      {confirmDeleteTarget && (
        <ConfirmDialog
          title="Delete Target"
          message="Are you sure you want to delete this target?"
          onConfirm={handleDeleteTarget}
          onClose={() => setConfirmDeleteTarget(null)}
          loading={deletingTarget}
        />
      )}
    </div>
  );
};

export default EmployeeDetail;
