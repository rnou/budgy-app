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
  Home,
  Heart,
  GraduationCap,
  Smile,
  ArrowUpCircle,
  ArrowDownCircle,
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
  Home,
  Heart,
  GraduationCap,
  Smile,
  ArrowUpCircle,
  ArrowDownCircle,
};

// ==================== STANDARDIZED CATEGORIES ====================
export const CATEGORIES = [
  { value: "Entertainment", label: "Entertainment", icon: "Tv" },
  { value: "Bills", label: "Bills", icon: "Home" },
  { value: "Groceries", label: "Groceries", icon: "ShoppingCart" },
  { value: "Dining Out", label: "Dining Out", icon: "Utensils" },
  { value: "Transportation", label: "Transportation", icon: "Car" },
  { value: "Personal Care", label: "Personal Care", icon: "Heart" },
  { value: "Education", label: "Education", icon: "GraduationCap" },
  { value: "Lifestyle", label: "Lifestyle", icon: "Smile" },
  { value: "Shopping", label: "Shopping", icon: "ShoppingBag" },
  { value: "General", label: "General", icon: "PiggyBank" },
];

export const getCategoryByValue = (value) => {
  return CATEGORIES.find(cat => cat.value === value) || CATEGORIES[CATEGORIES.length - 1];
};

export const getCategoryIcon = (categoryValue) => {
  const category = getCategoryByValue(categoryValue);
  return ICON_MAP[category.icon];
};

// ==================== LEGACY ====================
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

// ==================== COLOR OPTIONS ====================
export const THEME_COLORS = [
  { value: "#277C78", label: "Teal", class: "bg-[#277C78]" },
  { value: "#82C9D7", label: "Cyan", class: "bg-[#82C9D7]" },
  { value: "#F2CDAC", label: "Beige", class: "bg-[#F2CDAC]" },
  { value: "#626070", label: "Gray", class: "bg-[#626070]" },
  { value: "#C94736", label: "Red", class: "bg-[#C94736]" },
  { value: "#826CB0", label: "Purple", class: "bg-[#826CB0]" },
  { value: "#597C7C", label: "Dark Teal", class: "bg-[#597C7C]" },
  { value: "#BE6C49", label: "Orange", class: "bg-[#BE6C49]" },
];

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

// ==================== TRANSACTION TYPES ====================
export const TRANSACTION_TYPES = {
  INCOME: "income",
  EXPENSE: "expense",
  SAVING: "saving",
  WITHDRAW: "withdraw",
};

// ==================== FILTER TYPES ====================
export const FILTER_TYPES = {
  ALL: "all",
  INCOME: "income",
  EXPENSE: "expense",
  SAVING: "saving",
  WITHDRAW: "withdraw",
};

// ==================== DATE FORMAT OPTIONS ====================
export const DATE_FORMAT_OPTIONS = {
  SHORT: { day: "numeric", month: "short", year: "numeric" },
  LONG: { day: "numeric", month: "long", year: "numeric" },
  MONTH_YEAR: { month: "long", year: "numeric" },
};