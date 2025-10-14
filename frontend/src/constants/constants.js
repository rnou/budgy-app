import {
  Utensils,
  Car,
  ShoppingBag,
  Coffee,
  Fuel,
  Tv,
  ShoppingCart,
  PiggyBank,
  Gift,
  Plane,
  Laptop,
} from "lucide-react";

// Icon mapping - defined once, reused everywhere
export const ICON_MAP = {
  Utensils,
  Car,
  ShoppingBag,
  Coffee,
  Fuel,
  Tv,
  ShoppingCart,
  PiggyBank,
  Gift,
  Plane,
  Laptop,
};

// Category options for transactions
export const TRANSACTION_CATEGORIES = [
  { value: "restaurant", label: "Restaurant", icon: "Utensils" },
  { value: "groceries", label: "Groceries", icon: "ShoppingCart" },
  { value: "transport", label: "Transport", icon: "Car" },
  { value: "entertainment", label: "Entertainment", icon: "Tv" },
  { value: "coffee", label: "Coffee", icon: "Coffee" },
  { value: "shopping", label: "Shopping", icon: "ShoppingBag" },
  { value: "fuel", label: "Gas", icon: "Fuel" },
  { value: "income", label: "Income", icon: "ShoppingBag" },
  { value: "other", label: "Other", icon: "ShoppingBag" },
];

// Color options
export const COLOR_OPTIONS = [
  { value: "bg-blue-500", label: "Blue" },
  { value: "bg-green-500", label: "Green" },
  { value: "bg-orange-500", label: "Orange" },
  { value: "bg-purple-500", label: "Purple" },
  { value: "bg-red-500", label: "Red" },
  { value: "bg-amber-500", label: "Amber" },
  { value: "bg-teal-500", label: "Teal" },
  { value: "bg-pink-500", label: "Pink" },
];

// Transaction types
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
};

// Filter types
export const FILTER_TYPES = {
  ALL: "all",
  INCOME: "income",
  EXPENSE: "expense",
};

// Date format options
export const DATE_FORMAT_OPTIONS = {
  SHORT: { day: "numeric", month: "short", year: "numeric" },
  LONG: { day: "numeric", month: "long", year: "numeric" },
  MONTH_YEAR: { month: "long", year: "numeric" },
};
