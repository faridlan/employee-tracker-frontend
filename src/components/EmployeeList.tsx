import React, { useEffect, useMemo, useState } from "react";
import type { Employee } from "../types/employee";
import { getAllEmployees } from "../services/employeeService";
import { Link } from "react-router-dom";

interface Props {
  refreshTrigger: number;
}

const EmployeeList: React.FC<Props> = ({ refreshTrigger }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Filters
  const [search, setSearch] = useState("");
  const [filterOffice, setFilterOffice] = useState<string>("all");
  const [filterPosition, setFilterPosition] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<number | "all">("all");

  // ✅ Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Fetch employees
  useEffect(() => {
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
    fetchEmployees();
  }, [refreshTrigger]);

  // ✅ Extract filter options dynamically
  const offices = useMemo(
    () =>
      Array.from(
        new Set(employees.map((e) => e.office_location).filter(Boolean))
      ),
    [employees]
  );

  const positions = useMemo(
    () =>
      Array.from(
        new Set(employees.map((e) => e.position).filter(Boolean))
      ),
    [employees]
  );

  const entryYears = useMemo(
    () =>
      Array.from(
        new Set(
          employees.map((e) => new Date(e.entry_date).getFullYear())
        )
      ).sort((a, b) => b - a),
    [employees]
  );

  // ✅ Apply filters + search
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

  // ✅ Pagination logic
  const totalPages = Math.ceil(filteredEmployees.length / pageSize);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // ✅ UI Rendering
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
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
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
    </div>
  );
};

export default EmployeeList;
