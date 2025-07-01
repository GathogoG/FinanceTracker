
"use client";

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/page-header';
import { useFinancials, AppUser } from '@/context/financial-context';
import { collection, query, orderBy, onSnapshot, getDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Feedback {
    id: string;
    message: string;
    timestamp: any;
    userId: string;
    userDisplayName: string;
    userEmail: string;
    userPhotoURL?: string;
}

export default function AdminFeedbackPage() {
    const { user: adminUser } = useFinancials();
    const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!adminUser?.isAdmin || !db) {
            setLoading(false);
            return;
        }

        const feedbackQuery = query(collection(db, 'feedback'), orderBy('timestamp', 'desc'));
        
        const unsubscribe = onSnapshot(feedbackQuery, async (snapshot) => {
            const feedbacks = await Promise.all(snapshot.docs.map(async (doc) => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    timestamp: data.timestamp?.toDate().toLocaleString(),
                } as Feedback;
            }));
            
            setFeedbackList(feedbacks);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [adminUser]);

    if (loading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!adminUser?.isAdmin) {
        return <div className="text-center">Access Denied. You are not an admin.</div>;
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Feedback & Suggestions" description="Review user feedback to improve the app." />
            
            <div className="space-y-4">
                {feedbackList.length > 0 ? (
                    feedbackList.map(feedback => (
                        <Card key={feedback.id}>
                            <CardHeader>
                                <div className="flex items-center gap-4">
                                    <Avatar>
                                        <AvatarImage src={feedback.userPhotoURL} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-base">{feedback.userDisplayName}</CardTitle>
                                        <CardDescription>{feedback.userEmail} - {feedback.timestamp}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-foreground">{feedback.message}</p>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardContent className="p-12 text-center text-muted-foreground">
                            No feedback submitted yet.
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
