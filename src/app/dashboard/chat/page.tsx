"use client";
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { useFinancials, AppUser } from '@/context/financial-context';
import { PageHeader } from '@/components/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, User, Bot, Loader2, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { generateChatResponse } from '@/ai/flows/chat-flow';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'assistant' | 'admin';
    timestamp: any;
}

export default function ChatPage() {
    const { user } = useFinancials();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollViewportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!user || !db) return;

        const q = query(collection(db, `chats/${user.uid}/messages`), orderBy('timestamp'));
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
        });

        return () => unsubscribe();
    }, [user]);

    useEffect(() => {
        if (scrollViewportRef.current) {
            scrollViewportRef.current.scrollTo({ top: scrollViewportRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !user || !db) return;

        const tempInput = input;
        setInput('');

        const userMessageForDb = {
            text: tempInput,
            sender: 'user' as const,
            timestamp: serverTimestamp()
        };
        
        setIsLoading(true);

        const messagesRef = collection(db, `chats/${user.uid}/messages`);
        await addDoc(messagesRef, userMessageForDb);

        const chatDocRef = doc(db, 'chats', user.uid);
        await setDoc(chatDocRef, { 
            lastMessageAt: serverTimestamp(),
            user: {
                displayName: user.displayName,
                email: user.email,
                photoURL: user.photoURL,
            }
        }, { merge: true });
        
        try {
            const aiResponseText = await generateChatResponse({
                prompt: tempInput,
                userName: user.displayName || 'User',
            });
            
            await addDoc(messagesRef, { 
                text: aiResponseText,
                sender: 'assistant',
                timestamp: serverTimestamp() 
            });

        } catch (error) {
            console.error("Failed to get AI response:", error);
            const errorText = error instanceof Error ? error.message : "An unknown error occurred.";
            const errorMessage = {
                text: `Sorry, an error occurred: ${errorText}`,
                sender: 'assistant' as const,
                timestamp: serverTimestamp()
            };
            await addDoc(messagesRef, errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-15rem)]">
            <PageHeader title="Chat with JoSha" description="Your personal AI financial assistant." />
            <Card className="flex-1 mt-4 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1" viewportRef={scrollViewportRef}>
                    <div className="space-y-4 p-4">
                        {messages.map((message) => (
                            <div key={message.id} className={cn("flex items-start gap-3", message.sender === 'user' ? 'justify-end' : '')}>
                                {(message.sender === 'assistant' || message.sender === 'admin') && (
                                    <Avatar className={cn("h-8 w-8", message.sender === 'admin' && 'border-2 border-amber-500')}>
                                        <AvatarFallback><Bot /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className={cn("rounded-lg p-3 max-w-sm prose prose-sm prose-invert", 
                                    message.sender === 'user' ? 'bg-muted text-foreground prose-p:text-foreground' : 
                                    (message.sender === 'admin' ? 'bg-amber-500 text-amber-foreground' :'bg-primary text-primary-foreground')
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
                                        <AvatarImage src={(user as AppUser)?.photoURL || undefined} />
                                        <AvatarFallback><User /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                         {isLoading && (
                            <div className="flex items-start gap-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback><Bot /></AvatarFallback>
                                </Avatar>
                                <div className="rounded-lg p-3 bg-primary text-primary-foreground">
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>
                <CardContent className="p-4 border-t">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
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
