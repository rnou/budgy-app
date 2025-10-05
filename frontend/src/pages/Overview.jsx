import React from 'react';
import StatsCard from '../components/StatsCard';
import BudgetOverview from '../components/BudgetOverview';
import RecentTransactions from '../components/RecentTransactions';
import SavingsPots from '../components/SavingsPots';
import LoadingSpinner from '../components/LoadingSpinner';
import { useFinance } from '../contexts/FinanceContext';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

export const Overview = () => {
  const { stats, loading, error } = useFinance();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading data</h3>
          <p className="text-red-600 text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <LoadingSpinner />;
  }

  const statsData = [
    {
      title: "Current Balance",
      amount: `$${stats.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: Wallet,
      color: "blue",
      trend: null,
      trendValue: null
    },
    {
      title: "Income",
      amount: `$${stats.income.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "green",
      trend: "up",
      trendValue: stats.incomeChange
    },
    {
      title: "Expenses",
      amount: `$${stats.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: TrendingDown,
      color: "red",
      trend: "down",
      trendValue: stats.expensesChange
    },
    {
      title: "Savings",
      amount: `$${stats.savings.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: PiggyBank,
      color: "purple",
      trend: "up",
      trendValue: stats.savingsChange
    }
  ];

  return (
    <div className="p-4 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Overview</h1>
        <p className="text-gray-600">Track your financial health at a glance</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {statsData.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            amount={stat.amount}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
            trendValue={stat.trendValue}
          />
        ))}
      </div>

      {/* Secondary Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Transactions */}
        <div className="lg:col-span-2">
          <RecentTransactions />
        </div>
        
        {/* Right Column - Budget */}
        <div>
          <BudgetOverview />
        </div>
      </div>

      {/* Bottom Section - Savings Pots */}
      <div className="grid grid-cols-1">
        <SavingsPots />
      </div>
    </div>
  );
};

export default Overview;