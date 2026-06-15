import {
  Coffee,
  ShoppingCart,
  Car,
  Zap,
  ArrowUpCircle,
  Film,
  ShoppingBag,
  HeartPulse,
  type LucideIcon,
} from "lucide-react";

export interface CategoryConfig {
  label: string;
  dbValue: string;
  icon: LucideIcon;
  /** Tailwind classes for the triage quick-chips */
  colorTheme: string;
  /** Solid hex used for charts (donut slices / bars / badges) */
  color: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    label: "Food",
    dbValue: "Food & Dining",
    icon: Coffee,
    colorTheme: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
    color: "#f97316",
  },
  {
    label: "Groceries",
    dbValue: "Groceries",
    icon: ShoppingCart,
    colorTheme: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    color: "#22c55e",
  },
  {
    label: "Transport",
    dbValue: "Transport",
    icon: Car,
    colorTheme: "bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200",
    color: "#3b82f6",
  },
  {
    label: "Shopping",
    dbValue: "Shopping",
    icon: ShoppingBag,
    colorTheme: "bg-pink-50 text-pink-700 hover:bg-pink-100 border-pink-200",
    color: "#ec4899",
  },
  {
    label: "Health",
    dbValue: "Health & Medical",
    icon: HeartPulse,
    colorTheme: "bg-red-50 text-red-700 hover:bg-red-100 border-red-200",
    color: "#ef4444",
  },
  {
    label: "Fun",
    dbValue: "Entertainment",
    icon: Film,
    colorTheme: "bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200",
    color: "#a855f7",
  },
  {
    label: "Bills",
    dbValue: "Utilities",
    icon: Zap,
    colorTheme: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    color: "#f59e0b",
  },
  {
    label: "Income",
    dbValue: "Income",
    icon: ArrowUpCircle,
    colorTheme: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200",
    color: "#14b8a6",
  },
];

/** Categories that count as spending (everything except Income). */
export const SPENDING_CATEGORIES = CATEGORIES.filter((c) => c.dbValue !== "Income");

export const categoryByDbValue = (dbValue: string) =>
  CATEGORIES.find((c) => c.dbValue === dbValue);
