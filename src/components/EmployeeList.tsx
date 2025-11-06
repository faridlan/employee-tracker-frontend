import React, { useEffect, useMemo, useState } from "react";
import type { Employee } from "../types/employee";
import { getAllEmployees, deleteEmployee } from "../services/employeeService"; // ✅ ADDED
import { Link } from "react-router-dom";
import ConfirmDialog from "../components/common/ConfirmDialog"; // ✅ ADDED
import { useToast } from "../components/ToastProvider"; // ✅ ADDED

interface Props {
  refreshTrigger: number;
}

const EmployeeList: React.FC<Props> = ({ refreshTrigger }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { showToast } = useToast(); // ✅ ADDED

  // ✅ Delete State
  const [confirmEmployee, setConfirmEmployee] = useState<Employee | null>(null); // employee to delete
  const [deleting, setDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [filterOffice, setFilterOffice] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [refreshTrigger]);

  // Filter Options
  const offices = useMemo(
    () =>
      Array.from(
        new Set(employees.map((e) => e.office_location).filter(Boolean))
      ),
    [employees]
  );

  const positions = useMemo(
    () =>
      Array.from(new Set(employees.map((e) => e.position).filter(Boolean))),
    [employees]
  );

  const entryYears = useMemo(
    () =>
      Array.from(
        new Set(employees.map((e) => new Date(e.entry_date).getFullYear()))
      ).sort((a, b) => b - a),
    [employees]
  );

  // Apply filters + search
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        emp.name.toLowerCase().includes(search.toLowerCase()) ||
        emp.position.toLowerCase().includes(search.toLowerCase()) ||
        emp.office_location.toLowerCase().includes(search.toLowerCase());

      const matchesOffice =
        filterOffice === "all" ? true : emp.office_location === filterOffice;

      const matchesPosition =
        filterPosition === "all" ? true : emp.position === filterPosition;

      const matchesYear =
        filterYear === "all"
          ? true
          : new Date(emp.entry_date).getFullYear() === filterYear;

      return matchesSearch && matchesOffice && matchesPosition && matchesYear;
    });
  }, [employees, search, filterOffice, filterPosition, filterYear]);

  // Pagination
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ Handle Delete
  const handleDelete = async () => {
    if (!confirmEmployee) return;
    try {
      setDeleting(true);

      await deleteEmployee(confirmEmployee.id);

      showToast("Employee deleted ✅", "success");

      await fetchEmployees();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to delete employee ❌",
        "error"
      );
    } finally {
      setDeleting(false);
      setConfirmEmployee(null);
    }
  };

  // UI
  if (loading) return <p>Loading employees...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      {/* Header + Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
        <h2 className="text-xl font-semibold">👥 Employee List</h2>

        <input
          type="text"
          placeholder="Search by name, position, or office..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 w-full md:w-64 text-sm"
        />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 text-sm">
        <select
          value={filterOffice}
          onChange={(e) => setFilterOffice(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Offices</option>
          {offices.map((office) => (
            <option key={office} value={office}>
              {office}
            </option>
          ))}
        </select>

        <select
          value={filterPosition}
          onChange={(e) => setFilterPosition(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>

        <select
          value={filterYear}
          onChange={(e) =>
            setFilterYear(
              e.target.value === "all" ? "all" : Number(e.target.value)
            )
          }
          className="border rounded-lg px-3 py-2"
        >
          <option value="all">All Entry Years</option>
          {entryYears.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Position</th>
              <th className="px-4 py-2 text-left">Office</th>
              <th className="px-4 py-2 text-left">Entry Date</th>
              <th className="px-4 py-2 text-center">Targets</th>
              <th className="px-4 py-2 text-center">Actions</th> {/* ✅ ADDED */}
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="text-center py-4 text-gray-500 italic"
                >
                  No matching records found
                </td>
              </tr>
            ) : (
              paginatedEmployees.map((emp) => (
                <tr key={emp.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link
                      to={`/employees/${emp.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      {emp.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{emp.position}</td>
                  <td className="px-4 py-2">{emp.office_location}</td>
                  <td className="px-4 py-2">
                    {new Date(emp.entry_date).toLocaleDateString("id-ID", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {emp.targets.length}
                  </td>

                  {/* ✅ Delete Button */}
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => setConfirmEmployee(emp)}
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

      {/* ✅ Confirm Delete Dialog */}
      {confirmEmployee && (
        <ConfirmDialog
          title="Delete Employee"
          message={
            <div className="space-y-2">
              <p className="text-sm">
                Are you sure you want to delete this employee? This will remove them
                from the active employee list, but their past targets will remain as
                historical records.
              </p>

              {/* Profile-style info box */}
              <div className="mt-3 text-sm bg-gray-50 p-3 rounded-lg border">
                <p>
                  <strong>Name:</strong> {confirmEmployee.name}
                </p>
                <p>
                  <strong>Position:</strong> {confirmEmployee.position}
                </p>
                <p>
                  <strong>Office:</strong> {confirmEmployee.office_location}
                </p>
                <p>
                  <strong>Targets on Record:</strong> {confirmEmployee.targets.length}
                </p>
              </div>
            </div>
          }
          onConfirm={handleDelete}
          onClose={() => !deleting && setConfirmEmployee(null)}
          loading={deleting}
        />
      )}
    </div>
  );
};

export default EmployeeList;
