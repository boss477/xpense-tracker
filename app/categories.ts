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
  Apple,
  TrendingUp,
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
    label: "Fruits",
    dbValue: "Fruits",
    icon: Apple,
    colorTheme: "bg-lime-500/10 text-lime-400 hover:bg-lime-500/20 border-lime-500/30",
    color: "#84cc16",
  },
  {
    label: "Investments",
    dbValue: "Investments",
    icon: TrendingUp,
    colorTheme: "bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border-indigo-500/30",
    color: "#6366f1",
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

export function extractMerchant(rawMessage: string): string {
  if (!rawMessage) return "Unknown Merchant";
  
  // Clean up boilerplate text to avoid false positive matches
  let cleanedMessage = rawMessage.replace(/Call \d+ for dispute\.?\s*/i, '');
  cleanedMessage = cleanedMessage.replace(/SMS BLOCK .*? to \d+\.?/i, '');

  let merchant = "Unknown Merchant";

  // FORMAT A: Check for the new format -> "; NEW SARAVANAA S credited."
  const newFormatMatch = cleanedMessage.match(/;\s*(.+?)\s+credited/i);
  // FORMAT B: Info format -> "Info: UPI/653121257200/Swiggy."
  const infoFormatMatch = cleanedMessage.match(/Info:\s*UPI\/\d+\/(.+?)(?:\.|$|\s)/i);
  // FORMAT C: Old/standard format -> "sent to Swiggy. UPI Ref..."
  const oldFormatMatch = cleanedMessage.match(/(?:sent to|paid to|to|VPA)\s+(.+?)(?:\s+on|\s+via|\s+Ref|\s+UPI|\.|$)/i);
  // FORMAT D: Income format -> "from REWAA KAMAL BAT."
  const incomeFormatMatch = cleanedMessage.match(/from\s+(.+?)(?:\.|\s+UPI|$)/i);

  if (newFormatMatch) {
    merchant = newFormatMatch[1].trim();
  } else if (infoFormatMatch) {
    merchant = infoFormatMatch[1].trim();
  } else if (oldFormatMatch) {
    merchant = oldFormatMatch[1].trim();
  } else if (incomeFormatMatch) {
    merchant = incomeFormatMatch[1].trim();
  }

  // Clean up any trailing punctuation just to be safe
  merchant = merchant.replace(/[.,;]+$/, "").trim();
  return merchant;
}

