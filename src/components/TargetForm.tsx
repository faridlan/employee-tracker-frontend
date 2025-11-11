import React, { useEffect, useState } from "react";
import Select from "react-select";
import { getAllEmployees } from "../services/employeeService";
import { getAllProducts } from "../services/productService";
import { createTarget } from "../services/targetService";
import type { Employee } from "../types/employee";
import type { Product } from "../types/product";
import IDRInput from "../components/common/IDRInput";

interface Props {
  onCreated: () => void;
}

const TargetForm: React.FC<Props> = ({ onCreated }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [employeeId, setEmployeeId] = useState("");
  const [productId, setProductId] = useState("");
  const [nominal, setNominal] = useState("");
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
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const numericNominal = Number(nominal.replace(/\./g, ""));

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

  const currentYear = new Date().getFullYear();

  // ✅ Prepare options for React Select
  const employeeOptions = employees.map((emp) => ({
    value: emp.id,
    label: `${emp.name} (${emp.office_location})`,
  }));

  const productOptions = products.map((p) => ({
    value: p.id,
    label: p.name,
  }));

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
        {/* ✅ Employee (Searchable) */}
        <div>
          <label className="block text-sm font-medium mb-1">Employee</label>
          <Select
            options={employeeOptions}
            value={employeeOptions.find((opt) => opt.value === employeeId) || null}
            onChange={(selected) => setEmployeeId(selected?.value || "")}
            placeholder="Search Employee..."
            isSearchable
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: "#000",
                boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
                "&:hover": { borderColor: "#000" },
                borderRadius: "0.5rem",
                padding: "2px 4px",
                minHeight: "42px",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                marginTop: 4,
                zIndex: 10,
              }),
            }}
          />
        </div>

        {/* ✅ Product (Searchable) */}
        <div>
          <label className="block text-sm font-medium mb-1">Product</label>
          <Select
            options={productOptions}
            value={productOptions.find((opt) => opt.value === productId) || null}
            onChange={(selected) => setProductId(selected?.value || "")}
            placeholder="Search Product..."
            isSearchable
            styles={{
              control: (base, state) => ({
                ...base,
                borderColor: "#000",
                boxShadow: state.isFocused ? "0 0 0 1px #000" : "none",
                "&:hover": { borderColor: "#000" },
                borderRadius: "0.5rem",
                padding: "2px 4px",
                minHeight: "42px",
              }),
              menu: (base) => ({
                ...base,
                borderRadius: "0.5rem",
                marginTop: 4,
                zIndex: 10,
              }),
            }}
          />
        </div>

        {/* Nominal */}
        <div>
          <IDRInput label={"Nominal Target"} value={nominal} onChange={setNominal} required />
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
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, i) => (
                <option key={i + 1} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Year dropdown */}
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              required
              className="w-full border rounded-lg px-3 py-2"
            >
              {Array.from({ length: 11 }, (_, i) => {
                const y = currentYear - i;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-[#005BAA] text-white rounded-lg hover:bg-[#0668C2] disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Target"}
      </button>
    </form>
  );
};

export default TargetForm;
