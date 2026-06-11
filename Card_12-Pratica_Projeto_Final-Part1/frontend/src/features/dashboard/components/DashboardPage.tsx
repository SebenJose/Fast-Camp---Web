import { DashboardHeader } from "./DashboardHeader";
import { DashboardSummaryGrid } from "./DashboardSummaryGrid";
import { ProductivityChartsSection } from "./ProductivityChartsSection";
import { TokenUsageChartCard } from "./TokenUsageChartCard";

export function DashboardPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-primary-black px-5 py-6 text-primary-title sm:px-8 lg:px-12 lg:py-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <DashboardHeader />
        <DashboardSummaryGrid />
        <TokenUsageChartCard />
        <ProductivityChartsSection />
      </div>
    </main>
  );
}
