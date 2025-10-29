import React, { useEffect, useState } from "react";
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

useEffect(() => {
  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllEmployees();
      setEmployees(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

    fetchEmployees();
  }, [refreshTrigger]);

  if (loading) return <p>Loading employees...</p>;
  if (error) return <p className="text-red-600">{error}</p>;

  return (
    <div className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Employee List</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
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
  {employees.map((emp) => (
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
        {new Date(emp.entry_date).toLocaleString()}
      </td>
      <td className="px-4 py-2 text-center">{emp.targets.length}</td>
    </tr>
  ))}
</tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeList;
