'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Send, Loader2, Paperclip, Check, CheckCheck, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/components/auth-provider';
import { getAllUsers, getUserProfile, saveChatMessage, getConversationMessages, setTypingStatus, listenForTypingStatus, markMessageAsRead, uploadChatImage } from '@/lib/firebase-services';
import { User } from '@/lib/types';
import { useEffect, useState, useRef, useCallback, memo } from 'react';
import { collection, query, orderBy, onSnapshot, Timestamp, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ErrorBoundary } from '@/components/error-boundary';
import { SkeletonUser, SkeletonChatHeader, SkeletonMessage, SkeletonLoader } from '@/components/skeleton-loader';
import { useIsMobile } from '@/lib/responsive';
import { MobileTouchInput } from '@/components/mobile-form-optimized';
import { TouchFriendlyButton } from '@/components/mobile-optimized-layout';

interface ChatMessage {
  id: string;
  senderId: string;
  content: string;
  imageUrl?: string;
  timestamp: Date;
  createdAt: Timestamp | Date;
  isRead: boolean;
  readAt?: Timestamp | Date;
}

// Memoized message bubble component for performance
const MessageBubble = memo(({ 
  msg, 
  isMe, 
  showAvatar, 
  isLastInGroup, 
  selectedUser, 
  currentUser 
}: {
  msg: ChatMessage;
  isMe: boolean;
  showAvatar: boolean;
  isLastInGroup: boolean;
  selectedUser: User;
  currentUser: User;
}) => (
  <div
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
      {msg.imageUrl && (
        <div className="mb-2">
          <img
            src={msg.imageUrl}
            alt="Shared image"
            className="rounded-lg max-w-full h-auto max-h-64 object-cover"
            loading="lazy"
          />
        </div>
      )}
      <p className="text-sm leading-snug">
        {msg.content !== '[Image]' ? msg.content : msg.imageUrl ? '' : 'Image'}
      </p>
      {isLastInGroup && (
        <span className={cn(
          "text-[9px] mt-0.5 flex items-center gap-1",
          isMe ? "justify-end text-white/90" : "text-slate-400"
        )}>
          {(() => {
            try {
              const date = msg.createdAt instanceof Date ? msg.createdAt : msg.createdAt?.toDate?.() ? new Date(msg.createdAt.toDate()) : new Date();
              return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } catch {
              return 'just now';
            }
          })()}
          {isMe && (
            msg.isRead ? (
              <CheckCheck className="h-3 w-3 text-blue-300" />
            ) : (
              <Check className="h-3 w-3 text-white/60" />
            )
          )}
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
))

MessageBubble.displayName = 'MessageBubble';

export default function ChatPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({}); // Track unread messages
  const [lastMessages, setLastMessages] = useState<Record<string, string>>({}); // Track last message preview
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const readReceiptTimeoutRef = useRef<NodeJS.Timeout>();
  const markedAsReadRef = useRef<Set<string>>(new Set());

  // Debounced typing status handler
  const handleTypingChange = useCallback(
    (value: string) => {
      setNewMessage(value);

      if (!currentUser || !selectedUser) return;

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set typing to true
      const conversationId = [currentUser.id, selectedUser.id].sort().join('_');
      setTypingStatus(conversationId, currentUser.id, true).catch(() => {});

      // Set timeout to mark as not typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingStatus(conversationId, currentUser.id, false).catch(() => {});
      }, 2000);
    },
    [currentUser, selectedUser]
  );

  // Batch mark messages as read to reduce Firestore writes
  const batchMarkMessagesAsRead = useCallback(
    (conversationId: string, msgs: ChatMessage[]) => {
      if (!currentUser || readReceiptTimeoutRef.current) return;

      // Collect unread messages from other user
      const unreadMessages = msgs.filter(
        msg => msg.senderId !== currentUser.id && !msg.isRead && !markedAsReadRef.current.has(msg.id)
      );

      if (unreadMessages.length === 0) return;

      // Debounce the batch update by 500ms
      readReceiptTimeoutRef.current = setTimeout(() => {
        // Mark all unread messages in parallel
        Promise.all(
          unreadMessages.map(msg => {
            markedAsReadRef.current.add(msg.id);
            return markMessageAsRead(conversationId, msg.id).catch(() => {});
          })
        ).finally(() => {
          readReceiptTimeoutRef.current = undefined;
        });
      }, 500);
    },
    [currentUser]
  );

  // Handle file upload
  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !selectedUser) return;

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploading(true);
    try {
      const conversationId = [currentUser.id, selectedUser.id].sort().join('_');
      const timestamp = new Date().getTime();
      const path = `chats/${conversationId}/${currentUser.id}/${timestamp}_${file.name}`;
      
      const imageUrl = await uploadChatImage(file, path);
      
      const msg = {
        senderId: currentUser.id,
        content: '[Image]',
        imageUrl,
      };

      await saveChatMessage(conversationId, msg);
      setNewMessage('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  }, [currentUser, selectedUser]);

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

          // Set up listeners for unread counts and last messages from each conversation
          filteredUsers.forEach(user => {
            const conversationId = [authUser.uid, user.id].sort().join('_');
            const q = query(
              collection(db, 'chats', conversationId, 'messages'),
              orderBy('createdAt', 'desc'),
              limit(1)
            );
            
            onSnapshot(q, (snapshot) => {
              if (!snapshot.empty) {
                const lastMsg = snapshot.docs[0].data();
                const preview = lastMsg.content?.length > 30 
                  ? lastMsg.content.substring(0, 30) + '...' 
                  : lastMsg.content || '[Image]';
                setLastMessages(prev => ({ ...prev, [user.id]: preview }));

                // Count unread messages
                const unreadQuery = query(
                  collection(db, 'chats', conversationId, 'messages'),
                  orderBy('createdAt', 'desc')
                );
                
                onSnapshot(unreadQuery, (unreadSnapshot) => {
                  const unreadCount = unreadSnapshot.docs.filter(
                    doc => doc.data().senderId !== authUser.uid && !doc.data().isRead
                  ).length;
                  setUnreadCounts(prev => ({ ...prev, [user.id]: unreadCount }));
                });
              }
            }, () => {
              // Silent error handling for listener
            });
          });
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
    markedAsReadRef.current.clear(); // Reset tracked messages

    // Listen for messages - limit to last 50 for performance
    const q = query(
      collection(db, 'chats', conversationId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(50)
    );

    const unsubscribeMessages = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt
      } as ChatMessage));
      
      setMessages(msgs);
      
      // Batch mark messages as read
      batchMarkMessagesAsRead(conversationId, msgs);

      // Scroll to bottom
      setTimeout(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
      }, 0);
    }, (error) => {
      console.error('Error listening to messages:', error);
    });

    // Listen for typing status
    const unsubscribeTyping = listenForTypingStatus(conversationId, (typingUserIds) => {
      const otherTyping = typingUserIds.filter(id => id !== currentUser.id);
      setTypingUsers(otherTyping);
    });

    return () => {
      unsubscribeMessages();
      unsubscribeTyping();
      // Clean up timers
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      if (readReceiptTimeoutRef.current) clearTimeout(readReceiptTimeoutRef.current);
      // Mark as not typing
      setTypingStatus(conversationId, currentUser.id, false).catch(() => {});
    };
  }, [currentUser, selectedUser, batchMarkMessagesAsRead]);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = newMessage.trim();
    if (!trimmedMessage || !currentUser || !selectedUser) {
      console.log('Send blocked - Missing:', { trimmedMessage: !!trimmedMessage, currentUser: !!currentUser, selectedUser: !!selectedUser });
      return;
    }

    const conversationId = [currentUser.id, selectedUser.id].sort().join('_');
    const msg = {
      senderId: currentUser.id,
      content: trimmedMessage,
    };

    console.log('Sending message:', { conversationId, msg });
    setNewMessage('');
    
    try {
      await saveChatMessage(conversationId, msg);
      console.log('Message sent successfully');
      // Mark as no longer typing
      setTypingStatus(conversationId, currentUser.id, false).catch(() => {});
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(trimmedMessage); // Restore message on error
    }
  }, [currentUser, selectedUser, newMessage]);

  if (authLoading || loading) {
    return (
      <div className={cn(
        "flex rounded-2xl border bg-white/20 dark:bg-black/20 backdrop-blur-md overflow-hidden",
        isMobile ? "flex-col h-[600px]" : "h-[calc(100vh-8rem)]"
      )}>
        {!isMobile && (
          <div className="w-1/3 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search chats" className="pl-10 bg-background/50" />
              </div>
            </div>
            <SkeletonLoader />
          </div>
        )}
        <div className={cn("flex flex-col bg-slate-50/50 dark:bg-slate-900/50", isMobile ? "w-full" : "w-2/3")}>
          <SkeletonChatHeader />
          <div className="flex-1 p-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <SkeletonMessage key={i} isMe={i % 2 === 0} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;
  
  return (
    <ErrorBoundary>
      <div className={cn(
        "flex rounded-2xl border bg-white/20 dark:bg-black/20 backdrop-blur-md overflow-hidden",
        isMobile ? "flex-col h-[600px] md:h-[calc(100vh-8rem)]" : "h-[calc(100vh-8rem)]"
      )}>
        {/* User List - Hidden on mobile when chat is selected */}
        {(!isMobile || !selectedUser) && (
          <div className={cn(
            "flex flex-col border-r",
            isMobile ? "w-full" : "w-1/3"
          )}>
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search chats" className="pl-10 bg-background/50 h-12" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              {users.filter(u => u.id !== currentUser.id).map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className={cn(
                    "p-4 flex items-center gap-4 cursor-pointer hover:bg-black/5 transition-colors relative",
                    selectedUser?.id === user.id && "bg-primary/10"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar>
                      <AvatarImage src={`https://picsum.photos/seed/${user.avatar}/200/200`} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {unreadCounts[user.id] ? (
                      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                        {unreadCounts[user.id] > 9 ? '9+' : unreadCounts[user.id]}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">{user.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {lastMessages[user.id] || 'Start conversation'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat View - Hidden on mobile when no chat selected */}
        {(!isMobile || selectedUser) && (
          <div className={cn(
            "flex flex-col bg-slate-50/50 dark:bg-slate-900/50",
            isMobile ? "w-full" : "w-2/3"
          )}>
            {selectedUser ? (
              <>
                {/* Chat Header */}
                <div className={cn(
                  "p-4 border-b flex items-center gap-4 bg-white/50 dark:bg-black/50 backdrop-blur-sm",
                  isMobile && "relative"
                )}>
                  {isMobile && (
                    <TouchFriendlyButton 
                      onClick={() => setSelectedUser(null)}
                      variant="ghost"
                      className="h-10 w-10"
                    >
                      <ArrowLeft className="h-5 w-5" />
                    </TouchFriendlyButton>
                  )}
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

                {/* Messages */}
                <div ref={scrollRef} className={cn(
                  "flex-1 overflow-y-auto space-y-1 scroll-smooth",
                  isMobile ? "p-3" : "p-4 lg:p-6"
                )}>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser.id;
                    const showAvatar = idx === 0 || messages[idx - 1].senderId !== msg.senderId;
                    const isLastInGroup = idx === messages.length - 1 || messages[idx + 1].senderId !== msg.senderId;

                    return (
                      <MessageBubble
                        key={msg.id}
                        msg={msg}
                        isMe={isMe}
                        showAvatar={showAvatar}
                        isLastInGroup={isLastInGroup}
                        selectedUser={selectedUser}
                        currentUser={currentUser}
                      />
                    );
                  })}

                  {typingUsers.length > 0 && (
                    <div className="flex items-end gap-2 mt-4">
                      <div className="w-8 flex-shrink-0">
                        <Avatar className="h-8 w-8 shadow-sm">
                          <AvatarImage src={`https://picsum.photos/seed/${selectedUser.avatar}/200/200`} />
                          <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="bg-white dark:bg-slate-800 border rounded-2xl rounded-tl-none px-3 py-1.5 shadow-sm">
                        <div className="flex items-center gap-1">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="h-2 w-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className={cn(
                  "bg-white/50 dark:bg-black/50 border-t backdrop-blur-sm",
                  isMobile ? "p-3" : "p-4"
                )}>
                  <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <TouchFriendlyButton
                      type="button"
                      variant="ghost"
                      disabled={uploading}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {uploading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Paperclip className="h-5 w-5" />
                      )}
                    </TouchFriendlyButton>
                    <Input
                      placeholder="Message..."
                      className="flex-1 h-12 bg-background/80 border-primary/10 rounded-xl px-6 focus-visible:ring-primary/20"
                      value={newMessage}
                      onChange={(e) => handleTypingChange(e.target.value)}
                    />
                    <TouchFriendlyButton
                      type="submit"
                      disabled={!newMessage.trim() || uploading}
                      className="bg-primary text-white hover:bg-primary/90"
                    >
                      <Send className="h-5 w-5" />
                    </TouchFriendlyButton>
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
        )}
      </div>
    </ErrorBoundary>
  );
}
