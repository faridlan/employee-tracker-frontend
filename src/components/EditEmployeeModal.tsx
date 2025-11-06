import React, { useState } from "react";
import { updateEmployee } from "../services/employeeService";
import type { Employee } from "../types/employee";
import { useToast } from "./ToastProvider";

interface Props {
  employee: Employee;
  onClose: () => void;
  onUpdated: (updated: Employee) => void; // return updated employee to parent
}

const EditEmployeeModal: React.FC<Props> = ({ employee, onClose, onUpdated }) => {
  const { showToast } = useToast();

  const [name, setName] = useState(employee.name);
  const [position, setPosition] = useState(employee.position);
  const [officeLocation, setOfficeLocation] = useState(employee.office_location);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !position || !officeLocation) {
      showToast("All fields are required", "error");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateEmployee(employee.id, {
        name: name.trim(),
        position,
        office_location: officeLocation,
      });

      showToast("Employee updated ✅", "success");

      onUpdated(updated); // pass updated employee back
      onClose();
    } catch (err: unknown) {
      showToast(
        err instanceof Error ? err.message : "Failed to update employee ❌",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-[420px] max-w-[90%]">
        <h2 className="text-lg font-semibold mb-4">Edit Employee</h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded-lg px-3 py-2"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Position */}
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

          {/* Office Location */}
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

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => !saving && onClose()}
              className="px-3 py-2 border rounded-lg hover:bg-gray-100 text-sm"
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm disabled:opacity-50"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
