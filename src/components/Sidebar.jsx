import React from 'react';
import { 
  LayoutDashboard, 
  ArrowUpDown, 
  PiggyBank, 
  Wallet, 
  Calendar,
  ChevronRight,
  X
} from 'lucide-react';

export const Sidebar = ({ isOpen = true, isMobile = false, onClose }) => {

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Overview',
      active: true
    },
    {
      icon: ArrowUpDown,
      label: 'Transactions',
      active: false
    },
    {
      icon: PiggyBank,
      label: 'Budgets',
      active: false
    },
    {
      icon: Wallet,
      label: 'Savings Pots',
      active: false
    },
    {
      icon: Calendar,
      label: 'Recurring Bills',
      active: false
    }
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        bg-gray-900 text-white h-full transition-all duration-300 z-50
        ${isMobile 
          ? `fixed top-0 left-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'} w-64` 
          : `${isOpen ? 'w-64' : 'w-20'}`
        }
      `}>
        <div className="p-6">
          {/* Mobile Close Button */}
          {isMobile && (
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold bg-gradient-to-r from-teal-400 via-green-400 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                BUDGY
              </span>

              <button 
                onClick={onClose}
                className="p-2 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>
          )}

          <nav className="space-y-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div
                  key={index}
                  onClick={isMobile ? onClose : undefined}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer transition-all duration-200 group ${
                    item.active 
                      ? 'bg-white text-gray-900 shadow-lg' 
                      : 'hover:bg-gray-800 text-gray-300 hover:text-white'
                  }`}
                >
                  <Icon size={20} className="min-w-[20px]" />
                  {(isOpen || isMobile) && (
                    <>
                      <span className="font-medium">{item.label}</span>
                      {item.active && (
                        <ChevronRight size={16} className="ml-auto" />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Sidebar;