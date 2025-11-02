import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById } from "../services/employeeService";
import type { Employee } from "../types/employee";
import getMonthName from "../helper/month";
import EmployeeChartForDetail from "../components/EmployeeChartForDetail";

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters and pagination
  const [search, setSearch] = useState("");
  const [filterYear, setFilterYear] = useState<number | "all">("all");
  const [filterMonth, setFilterMonth] = useState<number | "all">("all");
  const [filterProduct, setFilterProduct] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

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

  // Extract filters
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

      const matchesYear =
        filterYear === "all" ? true : t.year === filterYear;
      const matchesMonth =
        filterMonth === "all" ? true : t.month === filterMonth;
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

  // Rendering
  if (loading) return <p className="text-gray-500 p-4">Loading employee...</p>;
  if (error) return <p className="text-red-600 p-4">{error}</p>;
  if (!employee) return <p className="p-4">Employee not found.</p>;

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
      >
        ← Back
      </button>

      <div className="bg-white p-6 rounded-xl shadow">
        {/* Employee Info */}
        <h1 className="text-2xl font-bold mb-2">{employee.name}</h1>
        <p className="text-gray-600">{employee.position}</p>
        <p className="text-gray-500">{employee.office_location}</p>
        <p className="text-gray-500">
          Entry Date: {new Date(employee.entry_date).toLocaleDateString("id-ID")}
        </p>

        {/* Employee Performance Chart */}
        <EmployeeChartForDetail employeeId={employee.id}
        employeeName={employee.name}
        employeePosition={employee.position}
        entryDate={employee.entry_date}
        />

        <hr className="my-6" />

        {/* Sales Targets Section */}
        <h2 className="text-xl font-semibold mb-4">🎯 Sales Targets</h2>

        {/* Filters + Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-3">
          <input
            type="text"
            placeholder="Search by product, month, or year..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg px-3 py-2 w-full md:w-64 text-sm"
          />
        </div>

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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Month</th>
                <th className="px-4 py-2 text-center">Year</th>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-right">Target Nominal</th>
                <th className="px-4 py-2 text-right">Achievement</th>
                <th className="px-4 py-2 text-right">Created At</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTargets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-4 text-gray-500 italic"
                  >
                    No matching records found
                  </td>
                </tr>
              ) : (
                paginatedTargets.map((target) => (
                  <tr key={target.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-2">{getMonthName(target.month)}</td>
                    <td className="px-4 py-2 text-center">{target.year}</td>
                    <td className="px-4 py-2">{target.Product?.name || "—"}</td>
                    <td className="px-4 py-2 text-right">
                      Rp {target.nominal.toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {target.Achievement
                        ? `Rp ${target.Achievement.nominal.toLocaleString("id-ID")}`
                        : "—"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      {new Date(target.created_at).toLocaleDateString("id-ID")}
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
    </div>
  );
};

export default EmployeeDetail;
