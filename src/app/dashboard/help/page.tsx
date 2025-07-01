"use client"
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { SubmitFeedbackCard } from "@/components/submit-feedback-card";

const faqs = [
  {
    question: "How do I add a new account?",
    answer: "You can add a new bank account, credit card, or cash account from the 'Accounts' page. Click the 'Add Account' button and fill in the required details."
  },
  {
    question: "How do I add a new transaction?",
    answer: "Navigate to the 'Transactions' page. You can add an expense, income, or transfer using the respective buttons at the top of the page. The AI will automatically categorize your expenses."
  },
  {
    question: "How does investment tracking work?",
    answer: "On the 'Investments' page, click 'Add Investment'. Search for your stock or ETF, enter the quantity and purchase date, and our system will automatically fetch the historical price for you. Your portfolio's value will update with live market data."
  },
  {
    question: "How do I manage debts and borrowing?",
    answer: "To record money you've borrowed, use the 'Add Income' dialog and check the 'This is borrowed money' box. To pay it back, go to the 'Borrowing' page and click the 'Settle' button next to the outstanding debt."
  },
  {
    question: "Can I edit or delete accounts and investments?",
    answer: "Yes. On the 'Accounts' and 'Investments' pages, click the three-dot menu next to any item to find options to edit or delete it. Please be careful, as deleting cannot be undone."
  },
   {
    question: "How do I change the currency or theme?",
    answer: "You can customize your experience from the 'Settings' page, accessible from the sidebar. You can change the display currency and switch between light, dark, and system themes."
  },
  {
    question: "How does the AI Financial Plan work?",
    answer: "The AI plan generator uses your provided income, expenses, and goals to create a personalized financial strategy. You can access it from the 'AI Financial Plan' button on the main dashboard."
  }
];

export default function HelpPage() {
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Help & Support" 
        description="Find answers to your questions or get in touch with our support team." 
      />
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
            <Card>
                <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
                <CardDescription>Find answers to common questions below.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqs.map((faq, index) => (
                            <AccordionItem value={`item-${index}`} key={index}>
                                <AccordionTrigger>{faq.question}</AccordionTrigger>
                                <AccordionContent>
                                {faq.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>AI Support Chat</CardTitle>
                    <CardDescription>Still have questions? Ask our AI assistant.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button asChild>
                        <Link href="/dashboard/chat">
                            <MessageSquare className="mr-2 h-4 w-4" /> Start Chat
                        </Link>
                    </Button>
                </CardContent>
            </Card>
            <SubmitFeedbackCard />
        </div>
      </div>
    </div>
  );
}
