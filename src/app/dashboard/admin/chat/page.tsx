"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { useFinancials } from '@/context/financial-context';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MessageSquare, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AppUser } from '@/context/financial-context';

interface Conversation {
    userId: string;
    user: AppUser | null;
}

export default function AdminChatPage() {
    const { user: adminUser, loading: userLoading } = useFinancials();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userLoading) return;
        if (!adminUser?.isAdmin || !db) {
            setLoading(false);
            return;
        }

        const fetchConversations = async () => {
            setLoading(true);
            try {
                const chatsQuery = query(collection(db, 'chats'), orderBy('lastMessageAt', 'desc'));
                const chatsSnapshot = await getDocs(chatsQuery);
                
                const convos = chatsSnapshot.docs.map(doc => {
                    const data = doc.data();
                    return {
                        userId: doc.id,
                        user: data.user,
                    };
                });

                setConversations(convos as Conversation[]);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [adminUser, userLoading]);

    if (loading || userLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }

    if (!adminUser?.isAdmin) {
        return <div className="text-center">Access Denied. You are not an admin.</div>;
    }

    return (
        <div className="space-y-8">
            <PageHeader title="User Conversations" description="Review and respond to user support chats." />
            <Card>
                <CardHeader>
                    <CardTitle>All Chats</CardTitle>
                    <CardDescription>Select a conversation to view and reply.</CardDescription>
                </CardHeader>
                <CardContent>
                    {conversations.length > 0 ? (
                        <div className="space-y-2">
                            {conversations.map(convo => (
                                <Link href={`/dashboard/admin/chat/${convo.userId}`} key={convo.userId} className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/50 cursor-pointer border">
                                    <Avatar>
                                        <AvatarImage src={convo.user?.photoURL || undefined} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="font-semibold">{convo.user?.displayName || 'Unknown User'}</p>
                                        <p className="text-sm text-muted-foreground">{convo.user?.email}</p>
                                    </div>
                                    <MessageSquare className="h-5 w-5 text-muted-foreground" />
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No user conversations found.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
