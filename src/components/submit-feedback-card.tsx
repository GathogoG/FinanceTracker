"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { useFinancials } from '@/context/financial-context';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export function SubmitFeedbackCard() {
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { submitFeedback } = useFinancials();
    const { toast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            toast({ title: "Please enter your feedback.", variant: "destructive"});
            return;
        }
        setIsLoading(true);
        try {
            await submitFeedback(message);
            toast({ title: "Feedback submitted!", description: "Thank you for helping us improve." });
            setMessage('');
        } catch (error) {
            toast({ title: "Error", description: "Could not submit feedback. Please try again.", variant: "destructive" });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Card>
            <form onSubmit={handleSubmit}>
                <CardHeader>
                    <CardTitle>Feedback & Suggestions</CardTitle>
                    <CardDescription>Have an idea or found a bug? Let us know!</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea 
                        placeholder="Type your message here..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={isLoading}
                    />
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Feedback
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
