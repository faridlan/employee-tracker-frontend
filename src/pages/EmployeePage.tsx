import React, { useState } from "react";
import EmployeeForm from "../components/EmployeeForm";
import EmployeeList from "../components/EmployeeList";

const EmployeePage: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEmployeeAdded = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">👥 Employee Management</h1>
      <EmployeeForm onEmployeeAdded={handleEmployeeAdded} />
      <EmployeeList refreshTrigger={refreshTrigger} />
    </div>
  );
};

export default EmployeePage;
