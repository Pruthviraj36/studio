'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Send, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getAllUsers, getUserProfile, saveChatMessage, getConversationMessages } from '@/lib/firebase-services';
import { User } from '@/lib/types';
import { useEffect, useState, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export default function ChatPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      if (authUser) {
        try {
          const [allUsers, profile] = await Promise.all([
            getAllUsers(),
            getUserProfile(authUser.uid)
          ]);
          const filteredUsers = allUsers.filter(u => u.id !== authUser.uid);
          setUsers(filteredUsers);
          if (profile) setCurrentUser(profile);
          if (filteredUsers.length > 0) {
            setSelectedUser(filteredUsers[0]);
          }
        } catch (error) {
          console.error('Error fetching chat data:', error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [authUser]);

  useEffect(() => {
    if (!currentUser || !selectedUser) return;

    const conversationId = [currentUser.id, selectedUser.id].sort().join('_');
    const q = query(
      collection(db, 'chats', conversationId, 'messages'),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [currentUser, selectedUser]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !selectedUser) return;

    const conversationId = [currentUser.id, selectedUser.id].sort().join('_');
    const msg = {
      senderId: currentUser.id,
      content: newMessage,
      timestamp: new Date(),
    };

    setNewMessage('');
    try {
      await saveChatMessage(conversationId, msg);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) return null;
  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-2xl border bg-white/20 dark:bg-black/20 backdrop-blur-md overflow-hidden">
      <div className="w-1/3 border-r flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input placeholder="Search chats" className="pl-10 bg-background/50" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {users.filter(u => u.id !== currentUser.id).map((user) => (
            <div
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className={cn(
                "p-4 flex items-center gap-4 cursor-pointer hover:bg-black/5 transition-colors",
                selectedUser?.id === user.id && "bg-primary/10"
              )}
            >
              <Avatar>
                <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/200/200`} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-muted-foreground truncate">Click to chat</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="w-2/3 flex flex-col bg-slate-50/50 dark:bg-slate-900/50">
        {selectedUser ? (
          <>
            <div className="p-4 border-b flex items-center gap-4 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-primary/20">
                  <AvatarImage src={`https://picsum.photos/seed/${selectedUser.avatar}/200/200`} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-green-500" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg leading-none">{selectedUser.name}</p>
                <p className="text-xs text-green-600 font-medium mt-1">Active</p>
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-1 scroll-smooth">
              {messages.map((msg, idx) => {
                const isMe = msg.senderId === currentUser.id;
                const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                const isLastInGroup = idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId;

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex items-end gap-2",
                      isMe ? "flex-row-reverse" : "flex-row",
                      showAvatar ? "mt-4" : "mt-0.5"
                    )}
                  >
                    <div className="w-8 flex-shrink-0">
                      {showAvatar && !isMe && (
                        <Avatar className="h-8 w-8 shadow-sm">
                          <AvatarImage src={`https://picsum.photos/seed/${selectedUser.avatar}/200/200`} />
                          <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>

                    <div
                      className={cn(
                        "group relative max-w-[85%] px-3 py-1.5 shadow-sm transition-all",
                        isMe
                          ? cn("bg-[#9897c2] text-white",
                            showAvatar ? "rounded-2xl rounded-tr-none" : "rounded-2xl")
                          : cn("bg-white dark:bg-slate-800 border",
                            showAvatar ? "rounded-2xl rounded-tl-none" : "rounded-2xl")
                      )}
                    >
                      <p className="text-sm leading-snug">{msg.content}</p>
                      {isLastInGroup && (
                        <span className={cn(
                          "text-[9px] mt-0.5 block opacity-60",
                          isMe ? "text-right text-white/90" : "text-slate-400"
                        )}>
                          {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'just now'}
                        </span>
                      )}
                    </div>

                    <div className="w-8 flex-shrink-0">
                      {showAvatar && isMe && (
                        <Avatar className="h-8 w-8 shadow-sm">
                          <AvatarImage src={`https://picsum.photos/seed/${currentUser.avatar}/200/200`} />
                          <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-white/50 dark:bg-black/50 border-t backdrop-blur-sm">
              <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                <Input
                  placeholder="Message..."
                  className="flex-1 h-12 bg-background/80 border-primary/10 rounded-xl px-6 focus-visible:ring-primary/20"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-12 w-12 rounded-xl bg-primary shadow-lg hover:shadow-primary/20 transition-all hover:scale-105"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-4">
            <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center">
              <Send className="h-10 w-10 text-primary/20" />
            </div>
            <p className="text-lg font-headline">Your Messages</p>
            <p className="text-sm max-w-[200px] text-center">Select a developer to start collaborating.</p>
          </div>
        )}
      </div>
    </div>
  );
}
