"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { CheckCircle2, ChartPie } from "lucide-react";
import { AddIncomeButton } from "./components/AddIncomeButton";
import { CATEGORIES } from "./categories";

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

  const categorizeExpense = async (id: string, newCategory: string) => {
    setExpenses((current) => current.filter((exp) => exp.id !== id));

    const { error } = await getSupabase()
      .from("expenses")
      .update({ category: newCategory })
      .eq("id", id);

    if (error) console.error("Failed to update category:", error);
  };

  return (
    <main className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans text-neutral-900">
      <div className="mx-auto max-w-lg space-y-6">

        {/* Header Section */}
        <header className="flex items-start justify-between gap-3 pb-4 border-b border-neutral-200">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Triage Engine</h1>
            <p className="text-sm text-neutral-500">Pending classification</p>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Link
              href="/insights"
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-neutral-600 border border-neutral-200 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <ChartPie className="h-4 w-4" />
              Insights
            </Link>
            <AddIncomeButton />
            <div className="flex items-center gap-2 bg-neutral-200/50 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-neutral-600">
                {expenses.length} Pending
              </span>
            </div>
          </div>
        </header>

        {/* Expenses List */}
        <div className="space-y-4">
          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-neutral-400 space-y-3 bg-white rounded-2xl border border-neutral-200 border-dashed">
              <CheckCircle2 className="w-12 h-12 text-neutral-300" />
              <p className="text-sm font-medium">Inbox zero! You are all caught up.</p>
            </div>
          ) : (
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg leading-none mb-1">
                      {expense.merchant || "Unknown Merchant"}
                    </h3>
                    <p className="text-xs text-neutral-500 font-medium">
                      {formatShortDate(expense.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-red-500 text-xl tracking-tight">
                      -₹{expense.amount}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-lg p-3 mb-4 border border-neutral-100">
                  <p className="text-xs text-neutral-500 font-mono break-words leading-relaxed">
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
                        onClick={() => categorizeExpense(expense.id, cat.dbValue)}
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
    </main>
  );
}
