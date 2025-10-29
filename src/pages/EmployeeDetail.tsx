import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmployeeById } from "../services/employeeService";
import type { Employee } from "../types/employee";

const EmployeeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <h1 className="text-2xl font-bold mb-2">{employee.name}</h1>
        <p className="text-gray-600">{employee.position}</p>
        <p className="text-gray-500">{employee.office_location}</p>
        <p className="text-gray-500">
          Entry Date: {new Date(employee.entry_date).toLocaleString()}
        </p>

        <hr className="my-4" />

        <h2 className="text-xl font-semibold mb-3">Sales Targets</h2>
        {employee.targets.length === 0 ? (
          <p className="text-gray-500">No targets assigned.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Product ID</th>
                  <th className="px-4 py-2 text-right">Nominal</th>
                </tr>
              </thead>
              <tbody>
                {employee.targets.map((target) => (
                  <tr key={target.id} className="border-t">
                    <td className="px-4 py-2">
                      {new Date(target.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2">{target.product_id}</td>
                    <td className="px-4 py-2 text-right">
                      Rp {target.nominal.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDetail;
