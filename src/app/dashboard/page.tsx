import { PageHeader } from "@/components/page-header";
import { AccountsCard } from "@/components/accounts-card";
import { RecentTransactions } from "@/components/recent-transactions";
import { NetWorthChart } from "@/components/net-worth-chart";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 md:gap-8">
      <PageHeader title="Overview" />
      <div className="grid gap-4 md:gap-8 grid-cols-1">
        <NetWorthChart />
      </div>
      <div className="grid gap-4 md:gap-8 grid-cols-1">
        <AccountsCard />
        <RecentTransactions />
      </div>
    </div>
  );
}
