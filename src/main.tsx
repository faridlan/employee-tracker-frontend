import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import EmployeeDetail from "./pages/EmployeeDetail";
import ProductCategoryPage from "./pages/ProductCategoryPage";
import Layout from "./components/Layout";
import "./index.css";
import TargetPage from "./pages/TargetPage";
import AchievementPage from "./pages/AchievementPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProductTargetChart from "./components/ProductTargetChart";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/categories-products" element={<ProductCategoryPage />} />
          <Route path="/targets" element={<TargetPage />} />
          <Route path="/achievements" element={<AchievementPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/analytics/products" element={<ProductTargetChart />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  </React.StrictMode>
);
