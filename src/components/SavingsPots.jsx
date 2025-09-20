import React from 'react';
import { PiggyBank, Gift, Plane, Laptop, Car } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

// Icon mapping for dynamic icons
const iconMap = {
  PiggyBank,
  Gift,
  Plane,
  Laptop,
  Car
};

export const SavingsPots = () => {
  const { savingsPots, totalSavings, loading } = useFinance();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
            <div className="h-4 bg-gray-200 rounded w-20"></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2"></div>
                <div className="flex justify-between">
                  <div className="h-3 bg-gray-200 rounded w-8"></div>
                  <div className="h-3 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Savings Pots</h2>
          <p className="text-sm text-gray-600">
            Total Saved: ${totalSavings.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Manage Pots →
        </button>
      </div>

      {/* Savings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {savingsPots.slice(0, 4).map((pot) => {
          const Icon = iconMap[pot.icon] || PiggyBank;
          const percentage = Math.round((pot.saved / pot.goal) * 100);
          
          return (
            <div key={pot.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
              {/* Pot Header */}
              <div className="flex items-center space-x-3 mb-3">
                <div className={`w-8 h-8 rounded-lg ${pot.color} flex items-center justify-center`}>
                  <Icon size={16} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{pot.name}</h3>
                  <p className="text-xs text-gray-500">
                    ${pot.saved} of ${pot.goal.toLocaleString()} saved
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full ${pot.color} transition-all duration-300`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {/* Percentage */}
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{percentage}%</span>
                <span className="text-xs font-medium text-gray-700">
                  ${(pot.goal - pot.saved).toLocaleString()} left
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SavingsPots;