"use client";

import { useState } from "react";
import { ArrowDownCircle, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";
import { SPENDING_CATEGORIES } from "../categories";

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AddExpenseButton({ onExpenseAdded }: { onExpenseAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [category, setCategory] = useState(SPENDING_CATEGORIES[0].dbValue);
  const [date, setDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        amount: parseFloat(amount),
        merchant: merchant,
        category: category,
        type: "expense",
        raw_message: `Manual expense entry: ${merchant}`,
        status: "Categorized",
      };
      
      if (date) {
        payload.created_at = new Date(date).toISOString();
      }

      const { error } = await getSupabase().from("expenses").insert([payload]);

      if (error) throw error;

      setAmount("");
      setMerchant("");
      setCategory(SPENDING_CATEGORIES[0].dbValue);
      setDate("");
      setIsOpen(false);
      if (onExpenseAdded) onExpenseAdded();
    } catch (error) {
      console.error("Failed to add expense:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/10 transition-colors"
      >
        <ArrowDownCircle className="h-4 w-4" />
        Add Expense
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsOpen(false)} />
          <div className="relative bg-[#1c1f17] rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 border border-white/5">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-white/40 hover:text-white/60"
            >
              <X className="h-4 w-4" />
            </button>
            <h2 className="text-lg font-bold mb-1 text-white">Add Expense</h2>
            <p className="text-sm text-white/50 mb-4">Manually log an expense with its category.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="expense-amount" className="text-sm font-medium text-white/80">Amount (₹)</label>
                <input
                  id="expense-amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-white/10 bg-black/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="expense-merchant" className="text-sm font-medium text-white/80">Merchant / Description</label>
                <input
                  id="expense-merchant"
                  required
                  placeholder="e.g., Swiggy, Uber"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full border border-white/10 bg-black/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="expense-category" className="text-sm font-medium text-white/80">Category</label>
                <select
                  id="expense-category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-white/10 bg-black/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {SPENDING_CATEGORIES.map((cat) => (
                    <option key={cat.dbValue} value={cat.dbValue}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label htmlFor="expense-date" className="text-sm font-medium text-white/80">Date & Time (Optional)</label>
                <input
                  id="expense-date"
                  type="datetime-local"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-white/10 bg-black/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {isSubmitting ? "Adding..." : "Save Expense"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
