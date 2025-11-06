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

import LogoFull from "../assets/logo-full.png";
import LogoIcon from "../assets/logo-icon.png";

interface SidebarProps {
  open: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ open }) => {
  const [openProducts, setOpenProducts] = useState(false);

  const baseLink =
    "relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200";

  return (
    <aside
      className={`${
        open ? "w-64" : "w-20"
      } bg-[#F8F6FB] h-screen shadow-md fixed top-0 left-0 flex flex-col transition-all duration-300`}
    >
      {/* Logo Section */}
      <div className="px-4 py-4 border-b border-gray-200 flex flex-col items-center">
        {open ? (
          <>
            <img
              src={LogoFull}
              alt="Bank Galuh Logo"
              className="w-[170px] object-contain"
            />
            <span className="text-[10px] text-[#815aa5] font-semibold mt-1 text-center tracking-wide">
              PERUMDA BPR GALUH CIAMIS
            </span>
          </>
        ) : (
          <img
            src={LogoIcon}
            alt="Bank Galuh Icon"
            className="w-12 h-12 object-contain"
          />
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-2">
        {/* Dashboard */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `${baseLink} ${
              isActive
                ? "text-[#815aa5] bg-[#815aa5]/10"
                : "text-gray-700 hover:bg-[#815aa5]/20 hover:text-[#815aa5]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Left Active Bar */}
              {isActive && (
                <span
                  className="absolute left-0 top-0 h-full w-1.5 rounded-r-lg"
                  style={{ backgroundColor: "#9d7fc2" }}
                />
              )}
              <Home size={18} />
              {open && "Dashboard"}
            </>
          )}
        </NavLink>

        {/* Target */}
        <NavLink
          to="/targets"
          className={({ isActive }) =>
            `${baseLink} ${
              isActive
                ? "text-[#815aa5] bg-[#815aa5]/10"
                : "text-gray-700 hover:bg-[#815aa5]/20 hover:text-[#815aa5]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute left-0 top-0 h-full w-1.5 rounded-r-lg"
                  style={{ backgroundColor: "#9d7fc2" }}
                />
              )}
              <Target size={18} />
              {open && "Target"}
            </>
          )}
        </NavLink>

        {/* Achievement */}
        <NavLink
          to="/achievements"
          className={({ isActive }) =>
            `${baseLink} ${
              isActive
                ? "text-[#815aa5] bg-[#815aa5]/10"
                : "text-gray-700 hover:bg-[#815aa5]/20 hover:text-[#815aa5]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute left-0 top-0 h-full w-1.5 rounded-r-lg"
                  style={{ backgroundColor: "#9d7fc2" }}
                />
              )}
              <Trophy size={18} />
              {open && "Achievement"}
            </>
          )}
        </NavLink>

        {/* Employee */}
        <NavLink
          to="/employees"
          className={({ isActive }) =>
            `${baseLink} ${
              isActive
                ? "text-[#815aa5] bg-[#815aa5]/10"
                : "text-gray-700 hover:bg-[#815aa5]/20 hover:text-[#815aa5]"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <span
                  className="absolute left-0 top-0 h-full w-1.5 rounded-r-lg"
                  style={{ backgroundColor: "#9d7fc2" }}
                />
              )}
              <Users size={18} />
              {open && "Employee"}
            </>
          )}
        </NavLink>

        {/* Products Section */}
        <button
          onClick={() => setOpenProducts(!openProducts)}
          className={`${baseLink} w-full justify-between ${
            openProducts
              ? "text-[#815aa5]"
              : "text-gray-700 hover:bg-[#815aa5]/20 hover:text-[#815aa5]"
          }`}
        >
          <span className="flex items-center gap-3">
            <Folder size={18} />
            {open && "Products"}
          </span>
          {open &&
            (openProducts ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
        </button>

        {/* Submenu */}
        <div
          className={`ml-8 mt-1 space-y-1 overflow-hidden transition-all duration-300 ${
            openProducts ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <NavLink
            to="/products-categories"
            className={({ isActive }) =>
              `${baseLink} ${
                isActive
                  ? "text-[#815aa5] bg-[#815aa5]/10"
                  : "text-gray-700 hover:bg-[#815aa5]/20 hover:text-[#815aa5]"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span
                    className="absolute left-0 top-0 h-full w-1.5 rounded-r-lg"
                    style={{ backgroundColor: "#9d7fc2" }}
                  />
                )}
                {open && "Categories & Products"}
              </>
            )}
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <footer className="text-center text-xs text-gray-500 py-4 border-t border-gray-200">
        {open ? "© 2025 Bank Galuh" : "©25"}
      </footer>
    </aside>
  );
};

export default Sidebar;
