"use client";

import { useState } from "react";
import { ArrowUpCircle, X } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function AddIncomeButton({ onIncomeAdded }: { onIncomeAdded?: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await getSupabase().from("expenses").insert([
        {
          amount: parseFloat(amount),
          merchant: source,
          category: "Income",
          type: "income",
          raw_message: `Manual income entry: ${source}`,
          status: "Categorized",
        },
      ]);

      if (error) throw error;

      setAmount("");
      setSource("");
      setIsOpen(false);
      if (onIncomeAdded) onIncomeAdded();
    } catch (error) {
      console.error("Failed to add income:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold text-emerald-400 border border-emerald-500/30 rounded-lg hover:bg-emerald-500/10 transition-colors"
      >
        <ArrowUpCircle className="h-4 w-4" />
        Add Income
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
            <h2 className="text-lg font-bold mb-1 text-white">Add Income</h2>
            <p className="text-sm text-white/50 mb-4">Manually log income that wasn&apos;t automatically tracked.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="amount" className="text-sm font-medium text-white/80">Amount (₹)</label>
                <input
                  id="amount"
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full border border-white/10 bg-black/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-white/20"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="source" className="text-sm font-medium text-white/80">Source</label>
                <input
                  id="source"
                  required
                  placeholder="e.g., Salary, Freelance, Father"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full border border-white/10 bg-black/20 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-white/20"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
              >
                {isSubmitting ? "Adding..." : "Save Income"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
