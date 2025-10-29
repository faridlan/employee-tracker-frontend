import React from "react";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const baseStyle =
    "px-4 py-2 rounded-lg font-medium transition-colors duration-200";
  const activeStyle = "bg-blue-600 text-white";
  const inactiveStyle = "text-gray-700 hover:bg-gray-200";

  return (
    <nav className="bg-white shadow mb-6 rounded-xl">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Company Dashboard</h1>

        <div className="flex space-x-4">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            Employees
          </NavLink>

          <NavLink
            to="/categories-products"
            className={({ isActive }) =>
              `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            Categories & Products
          </NavLink>

          <NavLink
            to="/targets"
            className={({ isActive }) =>
              `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            Targets
          </NavLink>

          <NavLink
            to="/achievements"
            className={({ isActive }) =>
              `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            Achievements
          </NavLink>

          {/* ✅ New Analytics Page Link */}
          <NavLink
            to="/analytics"
            className={({ isActive }) =>
              `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
            }
          >
            Analytics
          </NavLink>

          <NavLink
  to="/analytics/products"
  className={({ isActive }) =>
    `${baseStyle} ${isActive ? activeStyle : inactiveStyle}`
  }
>
  Product Chart
</NavLink>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
