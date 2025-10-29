import React from "react";
import EmployeeChart from "../components/EmployeeChart";

const AnalyticsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Analytics Dashboard</h1>
      <EmployeeChart />
    </div>
  );
};

export default AnalyticsPage;
