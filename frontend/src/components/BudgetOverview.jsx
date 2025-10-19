import { useNavigate } from "react-router-dom";
import React from "react";
import { MoreHorizontal } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";

export const BudgetOverview = () => {
  const { budgets = [], loading } = useFinance();
  const navigate = useNavigate();
  const handleShowMore = () => navigate("/budgets");

  const calculatePercentage = (spent, limitAmount) => {
    const spentNum = Number(spent) || 0;
    const limitNum = Number(limitAmount) || 1;
    return (spentNum / limitNum) * 100;
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);
    return isNaN(num) ? "0" : num.toFixed(0);
  };

    const renderBudgetItem = (item) => {
        if (!item) return null;

        const {
            id,
            category = "Unknown",
            spent = 0,
            limitAmount = 0,
            color = "bg-blue-500",
        } = item;

        const percentage = calculatePercentage(spent, limitAmount);
        const isOverBudget = percentage >= 100;

        const visualPercentage = Math.min(percentage, 100);

        return (
            <div key={id} className="space-y-2">
                <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {category}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${formatCurrency(spent)} / ${formatCurrency(limitAmount)}
                    </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                    <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                            width: `${visualPercentage}%`,
                            backgroundColor: isOverBudget ? '#EF4444' : color
                        }}
                    />
                </div>
                <div className="flex justify-end">
                    <span
                        className={`text-xs font-medium ${
                            isOverBudget ? "text-red-500" : "text-gray-500 dark:text-gray-400"
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
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                  <div key={i}>
                    <div className="flex justify-between mb-2">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"></div>
                  </div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  const displayBudgets = budgets.slice(0, 4);

  return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Budget Overview</h2>
          <button
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              aria-label="More options"
              onClick={handleShowMore}
          >
            <MoreHorizontal size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="space-y-4">
          {displayBudgets.length > 0 ? (
              displayBudgets.map(renderBudgetItem)
          ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>No budgets set yet</p>
                <button
                    className="mt-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm"
                    onClick={handleShowMore}>
                  Create your first budget
                </button>
              </div>
          )}
        </div>
        {displayBudgets.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  onClick={handleShowMore}>
                See Details →
              </button>
            </div>
        )}
      </div>
  );
};

export default BudgetOverview;