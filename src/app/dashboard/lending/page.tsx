"use client";

import { LendingList } from "@/components/lending-list";
import { PageHeader } from "@/components/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LendingPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Lending" description="Money that others owe you." />
      <div className="max-w-2xl">
        <Tabs defaultValue="outstanding" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="outstanding">Outstanding</TabsTrigger>
                <TabsTrigger value="settled">Settled</TabsTrigger>
            </TabsList>
            <TabsContent value="outstanding">
                <LendingList status="outstanding" />
            </TabsContent>
            <TabsContent value="settled">
                <LendingList status="settled" />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
