import React from "react";
import Navbar from "./Navbar";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <Navbar />
      <main className="p-6">{children}</main>
    </div>
  );
};

export default Layout;
