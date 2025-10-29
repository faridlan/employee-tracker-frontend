import React, { useEffect, useState } from "react";
import { getAllEmployees } from "../services/employeeService";
import { getTargetsByEmployee, NotFoundError } from "../services/targetService";
import type { Employee } from "../types/employee";
import type { Target } from "../types/target";

const EmployeeTargetList: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string>("");
  const [targets, setTargets] = useState<Target[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noTargets, setNoTargets] = useState(false);

  // Fetch employees for dropdown
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getAllEmployees();
        setEmployees(data);
      } catch {
        setEmployees([]);
      }
    };
    fetchEmployees();
  }, []);

  // Auto-fetch targets when employee changes
  useEffect(() => {
    const fetchTargets = async () => {
      if (!selectedEmployee) {
        setTargets([]);
        setNoTargets(false);
        setError(null);
        return;
      }

      setLoading(true);
      setError(null);
      setNoTargets(false);
      setTargets([]);

      try {
        const data = await getTargetsByEmployee(selectedEmployee);
        if (!Array.isArray(data) || data.length === 0) {
          setNoTargets(true);
        } else {
          setTargets(data);
        }
      } catch (err: unknown) {
        if (err instanceof NotFoundError) {
          setNoTargets(true);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("Failed to fetch employee targets");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, [selectedEmployee]);

  // Calculate totals safely
  const totalNominal = Array.isArray(targets)
    ? targets.reduce((sum, t) => sum + (t.nominal || 0), 0)
    : 0;

  const totalAchieved = Array.isArray(targets)
    ? targets.reduce((sum, t) => sum + (t.Achievement?.nominal || 0), 0)
    : 0;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Employee Target Lookup</h2>

      {/* Employee Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4 mb-4">
        <select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          className="border rounded-lg px-3 py-2 mb-2 md:mb-0"
        >
          <option value="">Select Employee</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name} ({emp.office_location})
            </option>
          ))}
        </select>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-500 animate-pulse">Loading employee targets...</p>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-3 rounded-lg mb-4">
          ❌ {error}
        </div>
      )}

      {/* No Targets Message */}
      {!loading && selectedEmployee && noTargets && !error && (
        <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 p-3 rounded-lg mt-4">
          ⚠️ No targets found for this employee.
        </div>
      )}

      {/* Table of Targets */}
      {targets.length > 0 && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Product</th>
                <th className="px-4 py-2 text-right">Nominal</th>
                <th className="px-4 py-2 text-left">Month</th>
                <th className="px-4 py-2 text-left">Year</th>
                <th className="px-4 py-2 text-right">Achievement</th>
              </tr>
            </thead>
            <tbody>
              {targets.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{t.Product?.name || "—"}</td>
                  <td className="px-4 py-2 text-right">
                    Rp {t.nominal.toLocaleString()}
                  </td>
                  <td className="px-4 py-2">{t.month}</td>
                  <td className="px-4 py-2">{t.year}</td>
                  <td className="px-4 py-2 text-right">
                    {t.Achievement ? `Rp ${t.Achievement.nominal.toLocaleString()}` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Section */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p>
              <strong>Total Target:</strong> Rp {totalNominal.toLocaleString()}
            </p>
            <p>
              <strong>Total Achieved:</strong> Rp {totalAchieved.toLocaleString()}
            </p>
            <p>
              <strong>Achievement %:</strong>{" "}
              {totalNominal > 0 ? ((totalAchieved / totalNominal) * 100).toFixed(2) : "0"}
              %
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTargetList;
