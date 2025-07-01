"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useParams, useRouter } from 'next/navigation';
import { useFinancials, AppUser } from '@/context/financial-context';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, Bot, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant' | 'admin';
    timestamp: any;
}

export default function AdminChatDetailPage() {
    const { user: adminUser } = useFinancials();
    const params = useParams();
    const router = useRouter();
    const userId = params.userId as string;
    
    const [messages, setMessages] = useState<Message[]>([]);
    const [targetUser, setTargetUser] = useState<AppUser | null>(null);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const scrollViewportRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (!userId || !db) return;

        const fetchUserData = async () => {
            const userDocRef = doc(db, 'users', userId);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists()) {
                setTargetUser({ uid: userDoc.id, ...userDoc.data() } as AppUser);
            }
        }
        fetchUserData();

        const q = query(collection(db, `chats/${userId}/messages`), orderBy('timestamp'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs
                .map(doc => {
                    const data = doc.data();
                    // Defensive check: ensure messages from Firestore are valid
                    if (data && typeof data.text === 'string' && typeof data.sender === 'string') {
                        return { id: doc.id, ...data } as Message;
                    }
                    console.warn("Skipping malformed message from Firestore:", doc.id);
                    return null;
                })
                .filter((msg): msg is Message => msg !== null); // Filter out any null (malformed) messages
            setMessages(msgs);
            setPageLoading(false);
        });

        return () => unsubscribe();
    }, [userId]);
    
     useEffect(() => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !userId || !db || !targetUser) return;

        const adminMessage = {
            text: input,
            sender: 'admin' as const,
            timestamp: serverTimestamp()
        };
        setInput('');
        setIsLoading(true);

        try {
            const messagesRef = collection(db, `chats/${userId}/messages`);
            await addDoc(messagesRef, adminMessage);

            const chatDocRef = doc(db, 'chats', userId);
            await setDoc(chatDocRef, {
                lastMessageAt: serverTimestamp(),
                user: {
                    displayName: targetUser.displayName,
                    email: targetUser.email,
                    photoURL: targetUser.photoURL,
                }
            }, { merge: true });

        } catch (error) {
            console.error("Failed to send admin message:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (pageLoading) {
        return <div className="flex h-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!adminUser?.isAdmin) {
        return <div className="text-center">Access Denied.</div>
    }

    return (
        <div className="flex flex-col h-[calc(100vh-15rem)]">
            <PageHeader title={`Chat with ${targetUser?.displayName || 'User'}`} description={targetUser?.email}>
                <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/admin/chat')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Chats
                </Button>
            </PageHeader>
            <Card className="flex-1 mt-4 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
                     <div className="p-4 space-y-4">
                        {messages.map((message) => (
                            <div key={message.id} className={cn("flex items-start gap-3", message.sender === 'user' ? 'justify-end' : '')}>
                                {(message.sender === 'assistant' || message.sender === 'admin') && (
                                    <Avatar className={cn("h-8 w-8", message.sender === 'admin' && 'border-2 border-primary')}>
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg p-3 max-w-sm prose prose-sm prose-invert", 
                                    message.sender === 'user' ? 'bg-muted text-foreground prose-p:text-foreground' :
                                    message.sender === 'admin' ? 'bg-amber-500 text-amber-foreground' : 'bg-primary text-primary-foreground'
                                )}>
                                    <ReactMarkdown
                                        components={{
                                            a: ({node, ...props}) => (
                                                <Button asChild variant="secondary" size="sm" className="mt-2 not-prose">
                                                    <Link href={props.href || ''}>
                                                        {props.children}
                                                        <ArrowRight className="ml-2 h-4 w-4" />
                                                    </Link>
                                                </Button>
                                            ),
                                            p: ({node, ...props}) => <p className="my-0" {...props} />
                                        }}
                                    >
                                        {message.text}
                                    </ReactMarkdown>
                                </div>
                                {message.sender === 'user' && (
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={targetUser?.photoURL || undefined} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <CardContent className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your reply..."
                            disabled={isLoading}
                        />
                        <Button type="submit" disabled={isLoading || !input.trim()}>
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
