import React from "react";
import ProductTargetChart from "./components/ProductTargetChart";
import OverallTargetAchievementChart from "./components/OverallTargetAchievementChart";
import TopEmployeesTable from "./components/TopEmployeesTable";

const DashboardPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-10">

      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur p-4 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-[#005BAA]">📊 Analytics Dashboard</h1>
      </header>

      {/* ⭐ FULL-WIDTH PRODUCT CHART */}
      <section className="w-full">
        <ProductTargetChart />
      </section>

      {/* ⭐ FULL-WIDTH OVERALL LINE CHART */}
      <section className="w-full">
        <OverallTargetAchievementChart />
      </section>

      {/* ⭐ FULL-WIDTH TOP EMPLOYEES */}
      <section className="w-full">
        <TopEmployeesTable />
      </section>

    </div>
  );
};

export default DashboardPage;
