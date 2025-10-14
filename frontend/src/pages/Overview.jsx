import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/apiService";
import RecentTransactions from "../components/RecentTransactions";
import BudgetOverview from "../components/BudgetOverview";
import SavingsPots from "../components/SavingsPots";

const Overview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("userId");

      if (!userId || userId === "null") {
        setError("User not authenticated. Please login again.");
        setLoading(false);
        return;
      }

      const data = await getDashboardStats(userId);
      setStats(data);
      setError(null);
    } catch (err) {
      console.error("Error loading dashboard stats:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const formatPercentage = (percent) => {
    if (!percent) return "0%";
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  const getPercentageColor = (percent) => {
    if (!percent) return "text-gray-500";
    return percent > 0 ? "text-green-500" : "text-red-500";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading dashboard: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Overview</h1>
        <p className="text-gray-600 mt-1">
          Track your financial health at a glance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Current Balance */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-blue-500 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                />
              </svg>
            </div>
            <span
              className={`text-sm font-semibold ${getPercentageColor(stats?.balanceChangePercent)}`}
            >
              {formatPercentage(stats?.balanceChangePercent)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Current Balance</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats?.currentBalance)}
          </p>
        </div>

        {/* Income */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-green-500 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </div>
            <span
              className={`text-sm font-semibold ${getPercentageColor(stats?.incomeChangePercent)}`}
            >
              {formatPercentage(stats?.incomeChangePercent)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Income</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats?.income)}
          </p>
        </div>

        {/* Expenses */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-red-500 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6"
                />
              </svg>
            </div>
            <span
              className={`text-sm font-semibold ${getPercentageColor(stats?.expenseChangePercent)}`}
            >
              {formatPercentage(stats?.expenseChangePercent)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Expenses</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats?.expenses)}
          </p>
        </div>

        {/* Savings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-2">
            <div className="bg-purple-500 p-3 rounded-lg">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                />
              </svg>
            </div>
            <span
              className={`text-sm font-semibold ${getPercentageColor(stats?.savingsChangePercent)}`}
            >
              {formatPercentage(stats?.savingsChangePercent)}
            </span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Savings</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(stats?.savings)}
          </p>
        </div>
      </div>

      {/* Period Info */}
      {stats?.period && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-700">
            📊 Statistics for{" "}
            <span className="font-semibold">{stats.period}</span>
            {stats.transactionCount > 0 && (
              <span> • {stats.transactionCount} transactions</span>
            )}
          </p>
        </div>
      )}

      {/* Secondary Content Grid - Transactions and Budget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Recent Transactions (2 columns) */}
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>

        {/* Right Column - Budget Overview (1 column) */}
        <div>
          <BudgetOverview />
        </div>
      </div>

      {/* Bottom Section - Savings Pots (Full Width) */}
      <div className="grid grid-cols-1">
        <SavingsPots />
      </div>
    </div>
  );
};

export default Overview;
