import React from "react";
import { MoreHorizontal } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";

export const BudgetOverview = () => {
  const { budgets = [], loading } = useFinance(); // Defensive: default empty array

  // Helper to safely calculate percentage
  const calculatePercentage = (spent, limit) => {
    const spentNum = Number(spent) || 0;
    const limitNum = Number(limit) || 1; // Avoid division by zero
    return Math.min((spentNum / limitNum) * 100, 100);
  };

  // Helper to safely format currency
  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? "0" : num.toFixed(0);
  };

  // Render single budget item
  const renderBudgetItem = (item) => {
    if (!item) return null;

    const {
      id,
      category = "Unknown",
      spent = 0,
      limit = 0,
      color = "bg-blue-500",
    } = item;

    const percentage = calculatePercentage(spent, limit);
    const isOverBudget = percentage >= 100;

    return (
      <div key={id} className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-700 capitalize">
            {category}
          </span>
          <span className="text-sm font-medium text-gray-900">
            ${formatCurrency(spent)} / ${formatCurrency(limit)}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isOverBudget ? "bg-red-500" : color
            }`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={percentage}
            aria-valuemin="0"
            aria-valuemax="100"
          />
        </div>

        {/* Percentage */}
        <div className="flex justify-end">
          <span
            className={`text-xs font-medium ${
              isOverBudget ? "text-red-500" : "text-gray-500"
            }`}
          >
            {percentage.toFixed(0)}%{isOverBudget && " (Over budget)"}
          </span>
        </div>
      </div>
    );
  };

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

  const displayBudgets = budgets.slice(0, 4);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Budget Overview</h2>
        <button
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          aria-label="More options"
        >
          <MoreHorizontal size={20} className="text-gray-500" />
        </button>
      </div>

      {/* Budget Items */}
      <div className="space-y-4">
        {displayBudgets.length > 0 ? (
          displayBudgets.map(renderBudgetItem)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No budgets set yet</p>
            <button className="mt-2 text-blue-600 hover:text-blue-700 text-sm">
              Create your first budget
            </button>
          </div>
        )}
      </div>

      {/* See Details Link */}
      {displayBudgets.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-100">
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
            See Details →
          </button>
        </div>
      )}
    </div>
  );
};

export default BudgetOverview;
