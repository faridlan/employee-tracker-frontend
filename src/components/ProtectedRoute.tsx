import React from "react";
import { Navigate } from "react-router-dom";

interface Props {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const isAuth = localStorage.getItem("auth") === "true";

  if (!isAuth) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export default ProtectedRoute;
