import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Image, Phone, MoreVertical, Loader2 } from 'lucide-react';
import { getChatThreads, getChatMessages } from '@/services/firestoreService';
import { Avatar } from '@/components/Avatar';
import { useApp } from '@/context/AppContext';
import { cn } from '@/utils/cn';

interface ChatThreadDisplay {
  id: string;
  participantName: string;
  participantId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  orderId?: string;
}

interface MessageDisplay {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  type: 'text' | 'image';
  read: boolean;
}

export function ChatListPage() {
  const navigate = useNavigate();
  const { currentUserId } = useApp();
  const [threads, setThreads] = useState<ChatThreadDisplay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchThreads() {
      setLoading(true);
      try {
        const data = await getChatThreads(currentUserId);
        // Transform Firestore data to display format
        const displayThreads: ChatThreadDisplay[] = data.map((t) => {
          const raw = t as unknown as Record<string, unknown>;
          // Handle both formats: old (participantName) and new (participantNames map)
          let name = 'Unknown';
          let partId = '';

          if (raw.participantName) {
            name = raw.participantName as string;
            partId = (raw.participantId as string) || '';
          } else if (raw.participantNames && typeof raw.participantNames === 'object') {
            const names = raw.participantNames as Record<string, string>;
            const participants = (raw.participants as string[]) || [];
            const otherId = participants.find(p => p !== currentUserId) || '';
            name = names[otherId] || 'Unknown';
            partId = otherId;
          } else if (raw.participants && Array.isArray(raw.participants)) {
            const participants = raw.participants as string[];
            partId = participants.find(p => p !== currentUserId) || '';
            name = partId;
          }

          return {
            id: t.id,
            participantName: name,
            participantId: partId,
            lastMessage: (raw.lastMessage as string) || '',
            lastMessageTime: (raw.lastMessageTime as string) || '',
            unreadCount: (raw.unreadCount as number) || 0,
            orderId: raw.orderId as string | undefined,
          };
        });
        setThreads(displayThreads);
      } catch (error) {
        console.error('Error fetching chat threads:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchThreads();
  }, [currentUserId]);

  return (
    <div className="p-4 lg:p-8  mx-auto animate-fade-in">
      <h1 className="text-xl lg:text-2xl font-bold text-stone-800 mb-4">Messages</h1>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={32} className="animate-spin text-amber-600" />
          <span className="ml-3 text-stone-500">Loading messages...</span>
        </div>
      ) : threads.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-stone-100">
          <span className="text-5xl">💬</span>
          <h3 className="text-lg font-semibold text-stone-700 mt-4">No messages yet</h3>
          <p className="text-sm text-stone-400 mt-1">Start a conversation by requesting custom art from an artist!</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden divide-y divide-stone-100">
          {threads.map(thread => (
            <button key={thread.id} onClick={() => navigate(`/chat/${thread.id}`)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-stone-50 transition-colors text-left">
              <div className="relative">
                <Avatar name={thread.participantName} size="lg" />
                {thread.unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-amber-600 rounded-full text-[10px] text-white font-bold flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn('text-sm', thread.unreadCount > 0 ? 'font-bold text-stone-800' : 'font-medium text-stone-700')}>
                    {thread.participantName}
                  </h3>
                  <span className={cn('text-xs shrink-0 ml-3', thread.unreadCount > 0 ? 'text-amber-600 font-semibold' : 'text-stone-400')}>
                    {thread.lastMessageTime}
                  </span>
                </div>
                <p className={cn('text-sm mt-0.5 truncate', thread.unreadCount > 0 ? 'text-stone-700 font-medium' : 'text-stone-400')}>
                  {thread.lastMessage}
                </p>
                {thread.orderId && (
                  <span className="inline-flex items-center mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-[10px] font-medium">
                    📋 Order #{thread.orderId}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function ChatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUserId } = useApp();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<MessageDisplay[]>([]);
  const [thread, setThread] = useState<ChatThreadDisplay | null>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);
      try {
        const [threadsRaw, msgsRaw] = await Promise.all([
          getChatThreads(currentUserId),
          getChatMessages(id),
        ]);

        // Find and transform thread
        const rawThread = threadsRaw.find(t => t.id === id);
        if (rawThread) {
          const raw = rawThread as unknown as Record<string, unknown>;
          let name = 'Unknown';
          let partId = '';
          if (raw.participantName) {
            name = raw.participantName as string;
            partId = (raw.participantId as string) || '';
          } else if (raw.participantNames && typeof raw.participantNames === 'object') {
            const names = raw.participantNames as Record<string, string>;
            const participants = (raw.participants as string[]) || [];
            const otherId = participants.find((p: string) => p !== currentUserId) || '';
            name = names[otherId] || 'Unknown';
            partId = otherId;
          }
          setThread({
            id: rawThread.id,
            participantName: name,
            participantId: partId,
            lastMessage: (raw.lastMessage as string) || '',
            lastMessageTime: (raw.lastMessageTime as string) || '',
            unreadCount: (raw.unreadCount as number) || 0,
            orderId: raw.orderId as string | undefined,
          });
        }

        // Transform messages
        const displayMsgs: MessageDisplay[] = msgsRaw.map((m) => {
          const raw = m as unknown as Record<string, unknown>;
          return {
            id: m.id,
            senderId: (raw.senderId as string) || '',
            receiverId: (raw.receiverId as string) || '',
            content: (raw.content as string) || '',
            timestamp: (raw.timestamp as string) || (raw.createdAt as string) || '',
            type: (raw.type as 'text' | 'image') || 'text',
            read: (raw.read as boolean) || false,
          };
        });
        setMessages(displayMsgs);
      } catch (error) {
        console.error('Error fetching chat:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-amber-600" />
      </div>
    );
  }

  if (!thread) {
    return <div className="flex items-center justify-center h-64"><p className="text-stone-500">Chat not found</p></div>;
  }

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      senderId: currentUserId,
      receiverId: thread.participantId,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text' as const,
      read: false,
    }]);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full  mx-auto">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => navigate('/chat')} className="flex items-center gap-2 text-stone-500 hover:text-stone-700 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <Avatar name={thread.participantName} size="md" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800 truncate">{thread.participantName}</h3>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
        {thread.orderId && (
          <button onClick={() => navigate(`/order/${thread.orderId}`)} className="hidden sm:flex items-center gap-1 text-xs text-amber-600 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg hover:bg-amber-100 transition-colors">
            📋 Order #{thread.orderId}
          </button>
        )}
        <button className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
          <Phone size={16} className="text-stone-600" />
        </button>
        <button className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center hover:bg-stone-200 transition-colors">
          <MoreVertical size={16} className="text-stone-600" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-4 space-y-3 bg-stone-50">
        {messages.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">💬</span>
            <p className="text-stone-400 mt-3 text-sm">No messages yet. Say hello!</p>
          </div>
        ) : messages.map(msg => {
          const isMe = msg.senderId === currentUserId;
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[70%] lg:max-w-[50%] rounded-2xl px-4 py-3',
                isMe ? 'bg-amber-600 text-white rounded-br-sm' : 'bg-white text-stone-800 rounded-bl-sm shadow-sm'
              )}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={cn('text-[10px] mt-1 text-right', isMe ? 'text-amber-200' : 'text-stone-400')}>{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-stone-200 px-4 lg:px-6 py-3 flex items-center gap-3 shrink-0">
        <button className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 hover:bg-stone-200 transition-colors">
          <Image size={18} className="text-stone-500" />
        </button>
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 px-4 py-2.5 bg-stone-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        <button onClick={handleSend} disabled={!newMessage.trim()}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all',
            newMessage.trim() ? 'bg-amber-600 text-white shadow-md hover:shadow-lg' : 'bg-stone-100 text-stone-400'
          )}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
