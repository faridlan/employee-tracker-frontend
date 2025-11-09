import React, { useState, useRef, useEffect } from "react";
import { Menu, LogOut } from "lucide-react";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
<nav
  className="flex justify-between items-center 
  bg-linear-to-r from-[#005BAA] to-[#0668C2]
  text-white px-6 py-3 shadow-md"
>
      {/* Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-white/20 rounded-lg transition"
      >
        <Menu size={22} />
      </button>

      {/* Right: User Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2 hover:bg-white/20 px-3 py-2 rounded-lg transition"
        >
          <img
            src="https://ui-avatars.com/api/?name=Admin&background=005BAA&color=fff"
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-white/30"
          />
          <span className="text-sm font-medium">Admin</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-44 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-100 z-10 overflow-hidden">
            <button
              onClick={() => {
                localStorage.removeItem("auth");
                window.location.href = "/login";
              }}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-red-50 hover:text-red-600 transition"
            >
              <LogOut size={16} className="text-red-500" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
