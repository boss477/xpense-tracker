import {
  Coffee,
  ShoppingCart,
  Car,
  Zap,
  ArrowUpCircle,
  Film,
  ShoppingBag,
  HeartPulse,
  Tag,
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
    colorTheme: "bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border-orange-500/30",
    color: "#f97316",
  },
  {
    label: "Groceries",
    dbValue: "Groceries",
    icon: ShoppingCart,
    colorTheme: "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border-emerald-500/30",
    color: "#22c55e",
  },
  {
    label: "Transport",
    dbValue: "Transport",
    icon: Car,
    colorTheme: "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 border-blue-500/30",
    color: "#3b82f6",
  },
  {
    label: "Shopping",
    dbValue: "Shopping",
    icon: ShoppingBag,
    colorTheme: "bg-pink-500/10 text-pink-400 hover:bg-pink-500/20 border-pink-500/30",
    color: "#ec4899",
  },
  {
    label: "Health",
    dbValue: "Health & Medical",
    icon: HeartPulse,
    colorTheme: "bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/30",
    color: "#ef4444",
  },
  {
    label: "Fun",
    dbValue: "Entertainment",
    icon: Film,
    colorTheme: "bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 border-purple-500/30",
    color: "#a855f7",
  },
  {
    label: "Bills",
    dbValue: "Utilities",
    icon: Zap,
    colorTheme: "bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border-amber-500/30",
    color: "#f59e0b",
  },
  {
    label: "Custom",
    dbValue: "Custom",
    icon: Tag,
    colorTheme: "bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 border-slate-500/30",
    color: "#64748b",
  },
  {
    label: "Income",
    dbValue: "Income",
    icon: ArrowUpCircle,
    colorTheme: "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20 border-teal-500/30",
    color: "#14b8a6",
  },
];

/** Categories that count as spending (everything except Income). */
export const SPENDING_CATEGORIES = CATEGORIES.filter((c) => c.dbValue !== "Income");

export const categoryByDbValue = (dbValue: string) =>
  CATEGORIES.find((c) => c.dbValue === dbValue);
