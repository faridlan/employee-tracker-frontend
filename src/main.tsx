import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Layout from "./components/Layout";
import "./index.css";
import TargetPage from "./pages/TargetPage";
import AchievementPage from "./pages/AchievementPage";
import ProductPage from "./pages/ProductPage";
import EmployeePage from "./pages/EmployeePage";
import EmployeeDetailPage from "./pages/EmployeeDetailPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ToastProvider } from "./components/ToastProvider";
import CategoryProductPage from "./pages/CategoryProductPage";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Layout>
                  <Routes>
                    <Route path="/" element={<App />} />
                    <Route path="/employees" element={<EmployeePage />} />
                    <Route path="/employees/:id" element={<EmployeeDetailPage />} />
                    <Route path="/products-categories" element={<CategoryProductPage />} />
                    <Route path="/products" element={<ProductPage />} />
                    <Route path="/targets" element={<TargetPage />} />
                    <Route path="/achievements" element={<AchievementPage />} />
                  </Routes>
                </Layout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
);
