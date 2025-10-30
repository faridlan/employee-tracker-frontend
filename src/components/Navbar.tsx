import React, { useState } from "react";
import { Menu, LogOut } from "lucide-react";

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="flex justify-between items-center bg-[#2f8bcc] text-white px-6 py-3 shadow-md">
      {/* Left: Sidebar Toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-[#92b0d2]/30 rounded-lg transition"
      >
        <Menu size={22} />
      </button>

      {/* Right: User Dropdown */}
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2 hover:bg-[#92b0d2]/30 px-3 py-2 rounded-lg transition"
        >
          <img
            src="https://ui-avatars.com/api/?name=Admin&background=2f8bcc&color=fff"
            alt="User avatar"
            className="w-8 h-8 rounded-full border border-white/20"
          />
          <span className="text-sm font-medium">Admin</span>
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white text-gray-800 rounded-lg shadow-lg border border-gray-200 z-10 animate-fadeIn">
            <button
              onClick={() => alert("Logged out")}
              className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition"
            >
              <LogOut size={16} className="text-[#d13e56]" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
