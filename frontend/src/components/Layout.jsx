import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import Overview from "../pages/Overview";
import Transactions from "../pages/Transactions";
import Profile from "../pages/Profile";
import Settings from "../pages/Settings";

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check if screen is mobile
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  return (
      <div className="h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        {/* Navbar */}
        <Navbar onMenuToggle={toggleSidebar} />

        {/* Main Content Area */}
        <div className="flex flex-1 overflow-hidden relative">
          {/* Sidebar */}
          <Sidebar
              isOpen={sidebarOpen}
              isMobile={isMobile}
              onClose={closeSidebar}
          />

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            <Routes>
              <Route path="/" element={<Overview />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              {/* Placeholder routes for future pages */}
              <Route
                  path="/budgets"
                  element={
                    <div className="p-8">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Budgets - Coming Soon
                      </h1>
                    </div>
                  }
              />
              <Route
                  path="/savings"
                  element={
                    <div className="p-8">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Savings Pots - Coming Soon
                      </h1>
                    </div>
                  }
              />
              <Route
                  path="/bills"
                  element={
                    <div className="p-8">
                      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Recurring Bills - Coming Soon
                      </h1>
                    </div>
                  }
              />
            </Routes>
          </div>
        </div>
      </div>
  );
};

export default Layout;