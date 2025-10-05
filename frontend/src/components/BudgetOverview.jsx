import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

export const BudgetOverview = () => {
  const { budgets, loading } = useFinance();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2"></div>
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
        <h2 className="text-xl font-bold text-gray-900">Budget Overview</h2>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Budget Items */}
      <div className="space-y-4">
        {budgets.slice(0, 4).map((item) => {
          const percentage = (item.spent / item.limit) * 100;
          const isOverBudget = percentage > 100;
          
          return (
            <div key={item.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-700">{item.category}</span>
                <span className="text-sm font-medium text-gray-900">
                  ${item.spent} / ${item.limit}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isOverBudget ? 'bg-red-500' : item.color
                  }`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              
              {/* Percentage */}
              <div className="flex justify-end">
                <span className={`text-xs font-medium ${
                  isOverBudget ? 'text-red-500' : 'text-gray-500'
                }`}>
                  {percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* See Details Link */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          See Details →
        </button>
      </div>
    </div>
  );
};

export default BudgetOverview;