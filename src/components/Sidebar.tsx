import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Target,
  Trophy,
  Users,
  Folder,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const [openProducts, setOpenProducts] = useState(false);

  const linkStyle =
    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";
  const active = "bg-[#2f8bcc] text-white shadow";
  const inactive =
    "text-gray-700 hover:bg-[#92b0d2]/20 hover:text-[#2f8bcc]";

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } bg-[#f8f9fb] h-screen shadow-md fixed top-0 left-0 flex flex-col transition-all duration-300`}
    >
      {/* Company Logo */}
      <div className="px-6 py-4 border-b border-[#d7d7d7] flex items-center gap-2">
        <div className="bg-[#2f8bcc] text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold">
          C
        </div>
        {open && <h2 className="text-lg font-bold text-[#2f8bcc]">Company</h2>}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? active : inactive}`}>
          <Home size={18} />
          {open && "Dashboard"}
        </NavLink>

        <NavLink to="/targets" className={({ isActive }) => `${linkStyle} ${isActive ? active : inactive}`}>
          <Target size={18} />
          {open && "Target"}
        </NavLink>

        <NavLink to="/achievements" className={({ isActive }) => `${linkStyle} ${isActive ? active : inactive}`}>
          <Trophy size={18} />
          {open && "Achievement"}
        </NavLink>

        <NavLink to="/employees" className={({ isActive }) => `${linkStyle} ${isActive ? active : inactive}`}>
          <Users size={18} />
          {open && "Employee"}
        </NavLink>

        {/* Products Section */}
        <button
          onClick={() => setOpenProducts(!openProducts)}
          className={`${linkStyle} w-full justify-between ${
            openProducts ? "text-[#2f8bcc]" : inactive
          }`}
        >
          <span className="flex items-center gap-3">
            <Folder size={18} />
            {open && "Products"}
          </span>
          {open &&
            (openProducts ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>

        {/* Submenu (only 1 item now) */}
        <div
          className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
            openProducts ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <NavLink
            to="/products-categories"
            className={({ isActive }) =>
              `${linkStyle} ${isActive ? active : inactive}`
            }
          >
            {open && "Categories & Products"}
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-[#d7d7d7]">
        {open ? "© 2025 Company Dashboard" : "©25"}
      </footer>
    </aside>
  );
};

export default Sidebar;
