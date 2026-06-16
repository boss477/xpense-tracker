"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, ChartPie } from "lucide-react";
import { AddIncomeButton } from "./components/AddIncomeButton";
import { CATEGORIES, type CategoryConfig } from "./categories";

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Expense {
  id: string;
  created_at: string;
  amount: number;
  merchant: string;
  raw_message: string;
  category: string;
}

export default function Dashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [activePrompt, setActivePrompt] = useState<{ expenseId: string; category: CategoryConfig } | null>(null);
  const [promptTitle, setPromptTitle] = useState("");
  const [promptCategory, setPromptCategory] = useState("");

  const formatShortDate = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const pad = (num: number) => String(num).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  useEffect(() => {
    const fetchExpenses = async () => {
      const { data, error } = await getSupabase()
        .from("expenses")
        .select("*")
        .eq("category", "Uncategorized")
        .order("created_at", { ascending: false });

      if (data) setExpenses(data);
      if (error) console.error("Error fetching:", error);
    };

    fetchExpenses();

    const channel = getSupabase()
      .channel("realtime-expenses")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "expenses" },
        (payload) => {
          const newExpense = payload.new as Expense;
          setExpenses((current) => [newExpense, ...current]);
        }
      )
      .subscribe();

    return () => {
      getSupabase().removeChannel(channel);
    };
  }, []);

  const categorizeExpense = async (id: string, newCategory: string, newMerchant: string) => {
    setExpenses((current) => current.filter((exp) => exp.id !== id));

    const { error } = await getSupabase()
      .from("expenses")
      .update({ category: newCategory, merchant: newMerchant })
      .eq("id", id);

    if (error) console.error("Failed to update category/merchant:", error);
  };

  const handleCategoryClick = (expenseId: string, cat: CategoryConfig) => {
    const expense = expenses.find(e => e.id === expenseId);
    setActivePrompt({ expenseId, category: cat });
    setPromptTitle(expense?.merchant && expense.merchant !== "Unknown Merchant" ? expense.merchant : "");
    setPromptCategory("");
  };

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePrompt || !promptTitle.trim()) return;
    
    if (activePrompt.category.label === "Custom" && !promptCategory.trim()) return;

    const finalCategory = activePrompt.category.label === "Custom" ? promptCategory.trim() : activePrompt.category.dbValue;
    
    categorizeExpense(activePrompt.expenseId, finalCategory, promptTitle.trim());
    setActivePrompt(null);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 font-sans text-white">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Header Section */}
        <header className="flex items-start justify-between gap-3 pb-4 border-b border-white/10">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Triage Engine</h1>
            <p className="text-sm text-white/40">Pending classification</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/insights"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-white/70 border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
            >
              <ChartPie className="h-4 w-4" />
              Insights
            </Link>
            <AddIncomeButton />
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-white/70">
                {expenses.length} Pending
              </span>
            </div>
          </div>
        </header>

        {/* Expenses List */}
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-white/40 space-y-3 bg-[#1c1f17] rounded-2xl border border-white/10 border-dashed">
              <CheckCircle2 className="w-12 h-12 text-white/20" />
              <p className="text-sm font-medium">Inbox zero! You are all caught up.</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-[#1c1f17] p-5 rounded-2xl border border-white/5 shadow-sm transition-all hover:shadow-md hover:border-white/10"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg leading-none mb-1">
                      {expense.merchant || "Unknown Merchant"}
                    </h3>
                    <p className="text-xs text-white/40 font-medium">
                      {formatShortDate(expense.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-500 text-xl tracking-tight">
                      -₹{expense.amount}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-3 mb-4 border border-white/5">
                  <p className="text-xs text-white/50 font-mono break-words leading-relaxed">
                    {expense.raw_message}
                  </p>
                </div>

                {/* Categorization Quick-Chips */}
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.label}
                        onClick={() => handleCategoryClick(expense.id, cat)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-xs font-semibold transition-colors ${cat.colorTheme}`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Unified Categorization Modal */}
      {activePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1c1f17] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-bold mb-4 text-white">
              {activePrompt.category.label === "Custom" 
                ? "Custom Category Details" 
                : `Categorizing as ${activePrompt.category.label}`}
            </h3>
            <form onSubmit={handlePromptSubmit}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                    Expense Title
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={promptTitle}
                    onChange={(e) => setPromptTitle(e.target.value)}
                    placeholder="e.g. Briyani, Uber, Rent"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                {activePrompt.category.label === "Custom" && (
                  <div>
                    <label className="block text-xs font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                      Category Name
                    </label>
                    <input
                      type="text"
                      value={promptCategory}
                      onChange={(e) => setPromptCategory(e.target.value)}
                      placeholder="e.g. Vacation, Gifts"
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActivePrompt(null)}
                  className="px-4 py-2 text-sm font-semibold text-white/70 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!promptTitle.trim() || (activePrompt.category.label === "Custom" && !promptCategory.trim())}
                  className="px-4 py-2 text-sm font-semibold bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Save & Categorize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
