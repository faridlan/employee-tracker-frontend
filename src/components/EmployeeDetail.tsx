import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById, deleteEmployee } from "../services/employeeService";
import { deleteTarget } from "../services/targetService";
import type { Employee } from "../types/employee";
import type { Target } from "../types/target";
import getMonthName from "../helper/month";
import EmployeeChartForDetail from "../components/EmployeeChartForDetail";

import ConfirmDialog from "../components/common/ConfirmDialog";
import EditEmployeeModal from "../components/EditEmployeeModal";
import { useToast } from "../components/ToastProvider";
import { Pencil, Trash, ThumbsUp, ThumbsDown } from "lucide-react";
import CombinedEditTargetAchievementModal from "./CombinedEditTargetAchiementModal";

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit employee modal
  const [showEditModal, setShowEditModal] = useState(false);

  // Target edit modal (combined Target+Achievement)
  const [showEditTargetModal, setShowEditTargetModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<Target | null>(null);

  // Delete employee
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Delete target
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<Target | null>(null);
  const [deletingTarget, setDeletingTarget] = useState(false);

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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
        if (err instanceof Error) setError(err.message);
        else setError("Failed to fetch employee");
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [id]);

  // Extract filter values
  const years = useMemo(() => {
    if (!employee) return [];
    return Array.from(new Set(employee.targets.map((t) => t.year))).sort(
      (a, b) => b - a
    );
  }, [employee]);

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const products = useMemo(() => {
    if (!employee) return [];
    return Array.from(
      new Set(
        employee.targets
          .map((t) => t.Product?.name)
          .filter((n): n is string => Boolean(n))
      )
    );
  }, [employee]);

  // Filter + search
  const filteredTargets = useMemo(() => {
    if (!employee) return [];
    return employee.targets.filter((t) => {
      const matchesSearch =
        t.Product?.name?.toLowerCase().includes(search.toLowerCase()) ||
        String(t.year).includes(search) ||
        getMonthName(t.month).toLowerCase().includes(search.toLowerCase());

      const matchesYear = filterYear === "all" ? true : t.year === filterYear;
      const matchesMonth = filterMonth === "all" ? true : t.month === filterMonth;
      const matchesProduct =
        filterProduct === "all" ? true : t.Product?.name === filterProduct;

      return matchesSearch && matchesYear && matchesMonth && matchesProduct;
    });
  }, [employee, search, filterYear, filterMonth, filterProduct]);

  // Pagination
  const totalPages = Math.ceil(filteredTargets.length / pageSize);
  const paginatedTargets = filteredTargets.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Delete employee
  const handleDeleteEmployee = async () => {
    if (!employee) return;

    try {
      setDeleting(true);
      await deleteEmployee(employee.id);
      showToast("Employee deleted ✅", "success");
      navigate("/employees");
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete employee ❌",
        "error"
      );
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  // Delete target
  const handleDeleteTarget = async () => {
    if (!confirmDeleteTarget) return;
    try {
      setDeletingTarget(true);
      await deleteTarget(confirmDeleteTarget.id);
      showToast("Target deleted (achievement removed if exists) ✅", "success");
      await refetchEmployee();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete target ❌",
        "error"
      );
    } finally {
      setDeletingTarget(false);
      setConfirmDeleteTarget(null);
    }
  };

  if (loading) return <p className="text-gray-500 p-4">Loading employee...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!employee) return <p className="p-4">Employee not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      {/* Header with Action Buttons */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>

        <div className="flex items-center gap-2">
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

      <div className="bg-white p-6 rounded-xl shadow">
        <h1 className="text-2xl font-bold mb-2">{employee.name}</h1>
        <p className="text-gray-600">{employee.position}</p>
        <p className="text-gray-500">{employee.office_location}</p>
        <p className="text-gray-500">
          Entry Date: {new Date(employee.entry_date).toLocaleDateString("id-ID")}
        </p>

        {/* Employee Performance Chart */}
        <EmployeeChartForDetail
          employeeId={employee.id}
          employeeName={employee.name}
          employeePosition={employee.position}
          entryDate={employee.entry_date}
        />

        <hr className="my-6" />

        <h2 className="text-xl font-semibold mb-4">🎯 Sales Targets</h2>

        {/* Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <input
            type="text"
            placeholder="Search by product, month, or year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-64 text-sm"
          />
        </div>

        {/* Filters */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
          <select
            value={filterYear}
            onChange={(e) =>
              setFilterYear(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
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
              setFilterMonth(
                e.target.value === "all" ? "all" : Number(e.target.value)
              )
            }
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Months</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {getMonthName(m)}
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

        {/* Targets Table (with Status + Actions) */}
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
              {paginatedTargets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-gray-500 italic">
                    No matching records found
                  </td>
                </tr>
              ) : (
                paginatedTargets.map((t) => {
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

                      {/* Status */}
                      <td className="px-4 py-2 text-center">
                        {t.Achievement ? (
                          achieved ? (
                            <span className="inline-flex items-center justify-center gap-1 text-green-600 font-medium">
                              <ThumbsUp size={16} /> Achieved
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center gap-1 text-red-600 font-medium">
                              <ThumbsDown size={16} /> Not Achieved
                            </span>
                          )
                        ) : (
                          <span className="text-gray-500 italic">No Data</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            title="Edit Target / Achievement"
                            onClick={() => {
                              setSelectedTarget(t);
                              setShowEditTargetModal(true);
                            }}
                            className="p-1 rounded hover:bg-yellow-50 text-yellow-600 hover:text-yellow-700"
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            title="Delete Target"
                            onClick={() => setConfirmDeleteTarget(t)}
                            className="p-1 rounded hover:bg-red-50 text-red-600 hover:text-red-700"
                          >
                            <Trash size={18} />
                          </button>
                        </div>
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

      {/* Edit Employee Modal */}
      {showEditModal && employee && (
        <EditEmployeeModal
          employee={employee}
          onClose={() => setShowEditModal(false)}
          onUpdated={async () => {
            await refetchEmployee();
            setShowEditModal(false);
          }}
        />
      )}

      {/* Combined Edit Target + Achievement Modal */}
      {showEditTargetModal && selectedTarget && (
        <CombinedEditTargetAchievementModal
          target={selectedTarget}
          onClose={() => setShowEditTargetModal(false)}
          onUpdated={async () => {
            await refetchEmployee();
            setShowEditTargetModal(false);
          }}
        />
      )}

      {/* Confirm Delete Target */}
      {confirmDeleteTarget && (
        <ConfirmDialog
          title="Delete Target"
          message={
            <div className="space-y-1">
              <p>
                Are you sure you want to delete this target? This will also permanently
                delete the related achievement if it exists.
              </p>
              <div className="mt-3 text-sm bg-gray-50 p-2 rounded-lg border">
                <p>
                  <strong>Product:</strong> {confirmDeleteTarget.Product?.name || "—"}
                </p>
                <p>
                  <strong>Month/Year:</strong> {getMonthName(confirmDeleteTarget.month)}{" "}
                  {confirmDeleteTarget.year}
                </p>
                <p>
                  <strong>Target:</strong> Rp{" "}
                  {confirmDeleteTarget.nominal.toLocaleString("id-ID")}
                </p>
              </div>
            </div>
          }
          onConfirm={handleDeleteTarget}
          onClose={() => !deletingTarget && setConfirmDeleteTarget(null)}
          loading={deletingTarget}
        />
      )}

      {/* Confirm Delete Employee */}
      {confirmDelete && employee && (
        <ConfirmDialog
          title="Delete Employee"
          message={
            <div className="space-y-2">
              <p className="text-sm">
                Are you sure you want to delete this employee? This will remove them
                from the active employee list, but their past targets will remain as
                historical records.
              </p>

              <div className="mt-3 text-sm bg-gray-50 p-3 rounded-lg border">
                <p>
                  <strong>Name:</strong> {employee.name}
                </p>
                <p>
                  <strong>Position:</strong> {employee.position}
                </p>
                <p>
                  <strong>Office:</strong> {employee.office_location}
                </p>
                <p>
                  <strong>Targets on Record:</strong> {employee.targets.length}
                </p>
              </div>
            </div>
          }
          onConfirm={handleDeleteEmployee}
          onClose={() => !deleting && setConfirmDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default EmployeeDetail;
