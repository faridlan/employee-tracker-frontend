import React, { useEffect, useRef, useState } from "react";
import { createEmployee } from "../services/employeeService";
import type { Employee } from "../types/employee";

interface Props {
  onEmployeeAdded: () => void;
}

const EmployeeForm: React.FC<Props> = ({ onEmployeeAdded }) => {
  const [name, setName] = useState("");
  const [position, setPosition] = useState("");
  const [officeLocation, setOfficeLocation] = useState("");
  const [entryDate, setEntryDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const dateRef = useRef<HTMLInputElement | null>(null);

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
    const employeeData: Omit<Employee, "id" | "created_at" | "updated_at" | "targets"> = {
      name,
      position,
      office_location: officeLocation,
      entry_date: new Date(entryDate).toISOString(), // ✅ ISO-8601 format
    };

    await createEmployee(employeeData); // ✅ no more "any"
    setSuccess(true);
    setName("");
    setPosition("");
    setOfficeLocation("");
    setEntryDate("");
    onEmployeeAdded();
  } catch (err: unknown) {
    if (err instanceof Error) {
      setError(err.message);
    } else {
      setError("Failed to add employee");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-xl shadow mb-6"
    >
      <h2 className="text-xl font-semibold mb-4">Add New Employee</h2>

      {error && <p className="text-red-600 mb-3">{error}</p>}
      {success && (
  <div className="bg-green-50 border border-green-300 text-green-700 px-3 py-2 rounded-lg mb-2">
    ✅ Employee added successfully
  </div>
)}

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Position</label>
<select
  value={position}
  onChange={(e) => setPosition(e.target.value)}
  className="w-full border rounded-lg px-3 py-2"
  required
>
  <option value="">Select Position</option>
  <option value="AO">AO (Account Officer)</option>
  <option value="FO">FO (Funding Officer)</option>
</select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Office Location</label>
<select
  value={officeLocation}
  onChange={(e) => setOfficeLocation(e.target.value)}
  className="w-full border rounded-lg px-3 py-2"
  required
>
  <option value="">Select Location</option>
  <option value="Kantor Kas Rancah">Kantor Kas Rancah</option>
  <option value="Kantor Kas Lakbok">Kantor Kas Lakbok</option>
  <option value="Kantor Pusat Ciamis">Kantor Pusat Ciamis</option>
</select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Entry Date</label>
<input
  type="date"
  ref={dateRef}
  value={entryDate}
  onChange={(e) => setEntryDate(e.target.value)}
  onFocus={() => dateRef.current?.showPicker()}
  onClick={() => dateRef.current?.showPicker()}
  className="w-full border rounded-lg px-3 py-2 cursor-pointer"
  required
/>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 px-4 py-2 bg-[#005BAA] text-white rounded-lg hover:bg-[#0668C2] disabled:opacity-50"
      >
        {loading ? "Saving..." : "Add Employee"}
      </button>
    </form>
  );
};

export default EmployeeForm;
