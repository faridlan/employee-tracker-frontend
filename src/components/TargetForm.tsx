import React, { useEffect, useState } from "react";
import { getAllEmployees } from "../services/employeeService";
import { getAllProducts } from "../services/productService";
import { createTarget } from "../services/targetService";
import type { Employee } from "../types/employee";
import type { Product } from "../types/product";
import IDRInput from "../components/common/IDRInput"; // ✅ Add this import

interface Props {
  onCreated: () => void;
}

const TargetForm: React.FC<Props> = ({ onCreated }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [productId, setProductId] = useState("");
  const [nominal, setNominal] = useState(""); // formatted value
  const [month, setMonth] = useState<number>(new Date().getMonth() + 1);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getAllEmployees().then(setEmployees).catch(() => setEmployees([]));
    getAllProducts().then(setProducts).catch(() => setProducts([]));
  }, []);

  useEffect(() => {
  if (success) {
    const timer = setTimeout(() => setSuccess(false), 3000); // hide after 3s
    return () => clearTimeout(timer);
  }
}, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const numericNominal = Number(nominal.replace(/\./g, "")); // ✅ convert to integer

      await createTarget({
        employee_id: employeeId,
        product_id: productId,
        nominal: numericNominal,
        month,
        year,
      });

      setSuccess(true);
      setEmployeeId("");
      setProductId("");
      setNominal("");
      setMonth(new Date().getMonth() + 1);
      setYear(new Date().getFullYear());
      onCreated();
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message);
      else setError("Failed to create target");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow">
      <h2 className="text-xl font-semibold mb-4">Add New Target</h2>
      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 px-3 py-2 rounded-lg mb-2">
          ⚠️ {error}
        </div>
      )}
      {success && (
  <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg mb-2">
    ✅ Target created successfully!
  </div>
)}

      <div className="grid md:grid-cols-2 gap-4">
        {/* Employee */}
        <div>
          <label className="block text-sm font-medium mb-1">Employee</label>
          <select
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Employee</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name} ({emp.office_location})
              </option>
            ))}
          </select>
        </div>

        {/* Product */}
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            required
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="">Select Product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Nominal (Formatted IDR) */}
        <div>
          <IDRInput value={nominal} onChange={setNominal} required />
        </div>

        {/* Month & Year */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Month</label>
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select Month</option>
              <option value="1">January</option>
              <option value="2">February</option>
              <option value="3">March</option>
              <option value="4">April</option>
              <option value="5">May</option>
              <option value="6">June</option>
              <option value="7">July</option>
              <option value="8">August</option>
              <option value="9">September</option>
              <option value="10">October</option>
              <option value="11">November</option>
              <option value="12">December</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Year</label>
            <input
              type="number"
              min={2000}
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Target"}
      </button>
    </form>
  );
};

export default TargetForm;
