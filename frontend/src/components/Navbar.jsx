import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ChevronDown, Menu, LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export const Navbar = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getInitials = (name) => {
    if (!name) return "U";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
      <nav className="bg-gray-900 dark:bg-gray-950 px-6 py-2 shadow-lg relative">
        <div className="flex items-center justify-between">
          {/* Mobile Menu Button + Logo Section */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Toggle */}
            <button
                onClick={onMenuToggle}
                className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-900 rounded-lg transition-all duration-200"
            >
              <Menu size={20} />
            </button>

            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-green-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            BUDGY
          </span>
          </div>

          {/* Right Section - Notifications and Profile */}
          <div className="flex items-center space-x-4">
            {/* Notifications */}
            <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 dark:hover:bg-gray-900 rounded-lg transition-all duration-200">
              <Bell size={20} />
              {/* Notification dot */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center space-x-3 hover:bg-gray-800 dark:hover:bg-gray-900 rounded-lg px-3 py-2 transition-all duration-200"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 dark:from-gray-500 dark:to-gray-600 rounded-full flex items-center justify-center ring-2 ring-gray-700 dark:ring-gray-600">
                <span className="text-sm font-medium text-white">
                  {getInitials(user?.name)}
                </span>
                </div>
                <span className="text-sm font-medium text-white hidden sm:block">
                {user?.name || "User"}
              </span>
                <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${showDropdown ? "rotate-180" : ""}`}
                />
              </button>

              {/* Dropdown Menu */}
              {showDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setShowDropdown(false)}
                    />

                    {/* Dropdown Content */}
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-20">
                      {/* User Info */}
                      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user?.email}
                        </p>
                      </div>

                      {/* Menu Items */}
                      <div className="py-1">
                        <button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate("/profile");
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <User size={16} />
                          <span>Profile</span>
                        </button>
                        <button
                            onClick={() => {
                              setShowDropdown(false);
                              navigate("/settings");
                            }}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                        >
                          <Settings size={16} />
                          <span>Settings</span>
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 dark:border-gray-700 py-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <LogOut size={16} />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  </>
              )}
            </div>
          </div>
        </div>
      </nav>
  );
};

export default Navbar;