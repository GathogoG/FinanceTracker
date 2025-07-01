"use client";

import { BorrowingList } from "@/components/borrowing-list";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function BorrowingPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Borrowing & Debts" description="Money you've borrowed from others." />
      <div className="max-w-2xl">
        <Tabs defaultValue="outstanding" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
                <TabsTrigger value="settled">Settled</TabsTrigger>
            </TabsList>
            <TabsContent value="outstanding">
                <BorrowingList status="outstanding" />
            </TabsContent>
            <TabsContent value="settled">
                <BorrowingList status="settled" />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
