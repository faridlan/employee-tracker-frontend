import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Layout from "./components/Layout";
import "./index.css";
import TargetPage from "./pages/TargetPage";
import AchievementPage from "./pages/AchievementPage";
import CategoryPage from "./pages/CategoryPage";
import ProductPage from "./pages/ProductPage";
import EmployeePage from "./pages/EmployeePage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/employees" element={<EmployeePage />} />
          <Route path="/employees/:id" element={<EmployeeDetailPage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/products" element={<ProductPage />} />
          <Route path="/targets" element={<TargetPage />} />
          <Route path="/achievements" element={<AchievementPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
