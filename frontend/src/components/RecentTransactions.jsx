import { useNavigate } from "react-router-dom";
import { MoreHorizontal, ShoppingBag } from "lucide-react";
import { useFinance } from "../contexts/FinanceContext";
import { ICON_MAP, DATE_FORMAT_OPTIONS } from "../constants/constants";

export const RecentTransactions = () => {
  const { recentTransactions = [], loading } = useFinance(); // Defensive: default to empty array
  const navigate = useNavigate();

  const handleViewAll = () => navigate("/transactions");
  const handleShowMore = () => navigate("/transactions");

  // Helper function to safely format date
  const formatDate = (dateString) => {
    if (!dateString) return "No date";

    try {
      return new Date(dateString).toLocaleDateString(
        "en-US",
        DATE_FORMAT_OPTIONS.SHORT,
      );
    } catch (error) {
      console.error("Invalid date:", dateString);
      return "Invalid date";
    }
  };

  // Helper function to safely format amount
  const formatAmount = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return "$0.00";
    return Math.abs(numAmount).toFixed(2);
  };

  // Render single transaction with defensive checks
  const renderTransaction = (transaction) => {
    if (!transaction) return null;

    const {
      id,
      icon = "ShoppingBag",
      color = "bg-gray-500",
      name = "Unknown",
      date,
      amount = 0,
    } = transaction;

    const Icon = ICON_MAP[icon] || ShoppingBag;
    const isPositive = Number(amount) > 0;

    return (
      <div
        key={id}
        className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors"
      >
        {/* Icon */}
        <div
          className={`w-10 h-10 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
        >
          <Icon size={18} className="text-white" />
        </div>

        {/* Transaction Info */}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{name}</p>
          <p className="text-sm text-gray-500">{formatDate(date)}</p>
        </div>

        {/* Amount */}
        <div className="text-right flex-shrink-0">
          <p
            className={`font-bold ${isPositive ? "text-green-600" : "text-gray-900"}`}
          >
            {isPositive ? "+" : ""}${formatAmount(amount)}
          </p>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="animate-pulse">
          <div className="flex justify-between items-center mb-6">
            <div className="h-6 bg-gray-200 rounded w-40"></div>
            <div className="h-4 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-16"></div>
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
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>
        <button
          onClick={handleViewAll}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          View All →
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {recentTransactions.length > 0 ? (
          recentTransactions.map(renderTransaction)
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No transactions yet</p>
            <button
              onClick={() => navigate("/transactions")}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm"
            >
              Add your first transaction
            </button>
          </div>
        )}
      </div>

      {/* More Options */}
      {recentTransactions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={handleShowMore}
            className="w-full flex items-center justify-center py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors"
          >
            <MoreHorizontal size={16} className="mr-2" />
            Show More Transactions
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;
