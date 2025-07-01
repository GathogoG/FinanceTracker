import { AddInvestmentDialog } from "@/components/add-investment-dialog";
import { InvestmentPortfolio } from "@/components/investment-portfolio";
import { InvestmentSummaryCard } from "@/components/investment-summary-card";
import { PageHeader } from "@/components/page-header";

export default function InvestmentsPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Investment Portfolio" description="A detailed overview of your investment holdings.">
        <AddInvestmentDialog />
      </PageHeader>
      <InvestmentSummaryCard />
      <InvestmentPortfolio />
    </div>
  );
}
