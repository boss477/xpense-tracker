import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpendingChart } from "../components/SpendingChart";

export default function InsightsPage() {
  return (
    <main className="min-h-screen p-4 md:p-8 font-sans text-white">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="flex items-center gap-3 pb-4 border-b border-white/10">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg hover:bg-white/10 transition-colors"
            aria-label="Back to triage"
          >
            <ArrowLeft className="h-5 w-5 text-white/70" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-sm text-white/40">Where your money goes</p>
          </div>
        </header>

        <SpendingChart />
      </div>
    </main>
  );
}
