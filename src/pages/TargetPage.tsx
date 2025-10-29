import React, { useState } from "react";
import TargetForm from "../components/TargetForm";
import TargetList from "../components/TargetList";
import EmployeeTargetList from "../components/EmployeeTargetList";

const TargetPage: React.FC = () => {
  const [refresh, setRefresh] = useState(0);
  const triggerRefresh = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Target Management</h1>
      <TargetForm onCreated={triggerRefresh} />
      <TargetList refreshTrigger={refresh} />
      <EmployeeTargetList />
    </div>
  );
};

export default TargetPage;
