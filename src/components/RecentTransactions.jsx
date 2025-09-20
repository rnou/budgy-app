import React from 'react';
import { 
  Utensils, 
  Car, 
  ShoppingBag, 
  Coffee, 
  Fuel,
  MoreHorizontal,
  Tv,
  ShoppingCart
} from 'lucide-react';
import { useFinance } from '../contexts/FinanceContext';

// Icon mapping for dynamic icons
const iconMap = {
  Utensils,
  Car,
  ShoppingBag,
  Coffee,
  Fuel,
  Tv,
  ShoppingCart
};

export const RecentTransactions = () => {
  const { recentTransactions, loading } = useFinance();

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
                <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
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
        <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View All →
        </button>
      </div>

      {/* Transaction List */}
      <div className="space-y-4">
        {recentTransactions.map((transaction) => {
          const Icon = iconMap[transaction.icon] || ShoppingBag;
          const isPositive = transaction.amount > 0;
          
          return (
            <div key={transaction.id} className="flex items-center space-x-4 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              {/* Icon */}
              <div className={`w-10 h-10 rounded-full ${transaction.color} flex items-center justify-center`}>
                <Icon size={18} className="text-white" />
              </div>
              
              {/* Transaction Info */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{transaction.name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(transaction.date).toLocaleDateString('en-US', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
              
              {/* Amount */}
              <div className="text-right">
                <p className={`font-bold ${
                  isPositive ? 'text-green-600' : 'text-gray-900'
                }`}>
                  {isPositive ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* More Options */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <button className="w-full flex items-center justify-center py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
          <MoreHorizontal size={16} className="mr-2" />
          Show More Transactions
        </button>
      </div>
    </div>
  );
};

export default RecentTransactions;