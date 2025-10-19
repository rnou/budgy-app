import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/apiService";
import RecentTransactions from "../components/RecentTransactions";
import BudgetOverview from "../components/BudgetOverview";
import SavingsPots from "../components/SavingsPots";
import StatsCard from "../components/StatsCard";
import {
  CreditCard,
  TrendingUp,
  TrendingDown,
  Sparkles
} from "lucide-react";

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
    if (percent === null || percent === undefined) return "0%";
    const sign = percent > 0 ? "+" : "";
    return `${sign}${percent.toFixed(1)}%`;
  };

  if (loading) {
    return (
        <div className="p-8">
          <div className="animate-pulse space-y-8">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-8">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
            Error loading dashboard: {error}
          </div>
        </div>
    );
  }

  return (
      <div className="p-8 space-y-8 min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Track your financial health at a glance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Current Balance */}
          <StatsCard
              title="Current Balance"
              amount={formatCurrency(stats?.currentBalance)}
              icon={CreditCard}
              trend={stats?.balanceChangePercent > 0 ? "up" : "down"}
              trendValue={formatPercentage(stats?.balanceChangePercent)}
              color="blue"
          />

          {/* Income */}
          <StatsCard
              title="Income"
              amount={formatCurrency(stats?.income)}
              icon={TrendingUp}
              trend={stats?.incomeChangePercent > 0 ? "up" : "down"}
              trendValue={formatPercentage(stats?.incomeChangePercent)}
              color="green"
          />

          {/* Expenses */}
          <StatsCard
              title="Expenses"
              amount={formatCurrency(stats?.expenses)}
              icon={TrendingDown}
              trend={stats?.expenseChangePercent > 0 ? "up" : "down"}
              trendValue={formatPercentage(stats?.expenseChangePercent)}
              color="red"
          />

          {/* Savings */}
          <StatsCard
              title="Savings"
              amount={formatCurrency(stats?.savings)}
              icon={Sparkles}
              trend={stats?.savingsChangePercent > 0 ? "up" : "down"}
              trendValue={formatPercentage(stats?.savingsChangePercent)}
              color="purple"
          />
        </div>

        {/* Period Info */}
        {stats?.period && (
            <div className="bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700 rounded-lg p-4">
              <p className="text-sm text-blue-700 dark:text-gray-400">
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