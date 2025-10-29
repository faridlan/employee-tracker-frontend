import React, { useState } from "react";
import EmployeeList from "./components/EmployeeList";
import EmployeeForm from "./components/EmployeeForm";

function App() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleEmployeeAdded = () => setRefreshTrigger((prev) => prev + 1);

  return (
    <div className="space-y-6">
      <EmployeeForm onEmployeeAdded={handleEmployeeAdded} />
      <EmployeeList refreshTrigger={refreshTrigger} />
    </div>
  );
}

export default App;
