import React from "react";
import { PiggyBank } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { ICON_MAP } from "../constants/constants";

export const SavingsPots = () => {
  const { savingsPots = [], totalSavings = 0, loading } = useFinance();

  // Helper to safely calculate percentage
  const calculatePercentage = (saved, goal) => {
    const savedNum = Number(saved) || 0;
    const goalNum = Number(goal) || 1;
    return Math.round(Math.min((savedNum / goalNum) * 100, 100));
  };

  // Helper to safely format currency
  const formatCurrency = (amount) => {
    const num = Number(amount);
    if (isNaN(num)) return "0";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });
  };

  // Helper to calculate remaining amount
  const calculateRemaining = (goal, saved) => {
    const remaining = (Number(goal) || 0) - (Number(saved) || 0);
    return Math.max(remaining, 0);
  };

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

  const displayPots = savingsPots.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Savings Pots</h2>
          <p className="text-sm text-gray-600">
            Total Saved: ${formatCurrency(totalSavings)}
          </p>
        </div>
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          Manage Pots →
        </button>
      </div>

      {/* Savings Grid - 2 columns on small screens and up */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {displayPots.length > 0 ? (
          displayPots.map((pot) => {
            if (!pot) return null;

            const {
              id,
              name = "Unnamed Pot",
              saved = 0,
              goal = 0,
              icon = "PiggyBank",
              color = "bg-teal-500",
            } = pot;

            const Icon = ICON_MAP[icon] || PiggyBank;
            const percentage = calculatePercentage(saved, goal);
            const remaining = calculateRemaining(goal, saved);

            return (
              <div
                key={id}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {/* Pot Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div
                    className={`w-8 h-8 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon size={16} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      ${formatCurrency(saved)} of ${formatCurrency(goal)} saved
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
                  <div
                    className={`h-2 rounded-full ${color} transition-all duration-300`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                  />
                </div>

                {/* Stats */}
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">{percentage}%</span>
                  <span className="text-xs font-medium text-gray-700">
                    ${formatCurrency(remaining)} left
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            <PiggyBank size={48} className="mx-auto mb-2 text-gray-300" />
            <p>No savings pots yet</p>
            <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
              Create your first savings pot
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SavingsPots;
