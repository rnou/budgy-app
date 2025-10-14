import React from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank } from "lucide-react";

export const StatsCard = ({
  title,
  amount,
  icon: IconComponent,
  trend,
  trendValue,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const trendColor = trend === "up" ? "text-green-500" : "text-red-500";

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center shadow-lg`}
        >
          <IconComponent size={24} className="text-white" />
        </div>
        {trendValue && (
          <div className={`flex items-center space-x-1 ${trendColor}`}>
            <TrendIcon size={16} />
            <span className="text-sm font-medium">{trendValue}</span>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-900">{amount}</p>
      </div>
    </div>
  );
};

export default StatsCard;
