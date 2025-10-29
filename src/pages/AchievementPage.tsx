import React, { useState } from "react";
import AchievementForm from "../components/AchievementForm";
import AchievementList from "../components/AchievementList";

const AchievementPage: React.FC = () => {
  const [refresh, setRefresh] = useState(0);
  const triggerRefresh = () => setRefresh((r) => r + 1);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-4">Achievements</h1>
      <AchievementForm onCreated={triggerRefresh} />
      <AchievementList refreshTrigger={refresh} />
    </div>
  );
};

export default AchievementPage;
