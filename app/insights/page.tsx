import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SpendingChart } from "../components/SpendingChart";

export default function InsightsPage() {
  return (
    <main className="min-h-screen bg-neutral-50 p-4 md:p-8 font-sans text-neutral-900">
      <div className="mx-auto max-w-lg space-y-6">
        <header className="flex items-center gap-3 pb-4 border-b border-neutral-200">
          <Link
            href="/"
            className="p-2 -ml-2 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Back to triage"
          >
            <ArrowLeft className="h-5 w-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Insights</h1>
            <p className="text-sm text-neutral-500">Where your money goes</p>
          </div>
        </header>

        <SpendingChart />
      </div>
    </main>
  );
}
