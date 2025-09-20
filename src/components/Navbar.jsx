import React from 'react';
import { Bell, ChevronDown, Menu } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export const Navbar = ({ onMenuToggle }) => {
  const { user } = useFinance();

  return (
    <nav className="bg-gray-900 px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Mobile Menu Button + Logo Section */}
        <div className="flex items-center space-x-4">
          {/* Mobile Menu Toggle */}
          <button 
            onClick={onMenuToggle}
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-orange-400 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-teal-400 via-green-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
              BUDGY
            </span>
          </div>
        </div>

        {/* Right Section - Notifications and Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200">
            <Bell size={20} />
            {/* Notification dot */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-800 rounded-lg px-3 py-2 transition-all duration-200">
              <div className="w-8 h-8 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center ring-2 ring-gray-700">
                <span className="text-sm font-medium text-white">
                  {user?.initials || 'RL'}
                </span>
              </div>
              <span className="text-sm font-medium text-white">
                {user?.name || 'Loading...'}
              </span>
              <ChevronDown size={16} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;