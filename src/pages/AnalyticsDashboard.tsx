import React from "react";
import ProductTargetChart from "../components/ProductTargetChart";
import OverallTargetAchievementChart from "../components/OverallTargetAchievementChart";

const AnalyticsDashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">📊 Analytics Dashboard</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <ProductTargetChart />
        <OverallTargetAchievementChart />
      </div>
    </div>
  );
};

export default AnalyticsDashboardPage;
