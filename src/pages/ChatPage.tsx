import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Image, Phone, MoreVertical } from 'lucide-react';
import { chatThreads, chatMessages } from '@/data/mockData';
import { Avatar } from '@/components/Avatar';
import { cn } from '@/utils/cn';

export function ChatListPage() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <div className="bg-white px-5 pt-3 pb-3 shadow-sm shrink-0">
        <h1 className="text-lg font-bold text-stone-800">Messages</h1>
      </div>

      <div className="flex-1 native-scroll px-5">
        {chatThreads.length === 0 ? (
          <div className="text-center py-12">
            <span className="text-4xl">💬</span>
            <h3 className="text-base font-semibold text-stone-700 mt-3">No messages yet</h3>
            <p className="text-xs text-stone-400 mt-1">Start a conversation with an artist!</p>
          </div>
        ) : (
          chatThreads.map(thread => (
            <button key={thread.id} onClick={() => navigate(`/chat/${thread.id}`)}
              className="w-full flex items-center gap-3 py-3 border-b border-stone-100 last:border-0 text-left">
              <div className="relative">
                <Avatar name={thread.participantName} size="md" />
                {thread.unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-600 rounded-full text-[9px] text-white font-bold flex items-center justify-center">
                    {thread.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={cn('text-sm truncate', thread.unreadCount > 0 ? 'font-bold text-stone-800' : 'font-medium text-stone-700')}>
                    {thread.participantName}
                  </h3>
                  <span className={cn('text-[10px] shrink-0 ml-2', thread.unreadCount > 0 ? 'text-amber-600 font-semibold' : 'text-stone-400')}>
                    {thread.lastMessageTime}
                  </span>
                </div>
                <p className={cn('text-[11px] mt-0.5 truncate', thread.unreadCount > 0 ? 'text-stone-700 font-medium' : 'text-stone-400')}>
                  {thread.lastMessage}
                </p>
                {thread.orderId && (
                  <span className="inline-flex items-center mt-1 px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded text-[9px] font-medium">
                    📋 #{thread.orderId}
                  </span>
                )}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

export function ChatDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState(chatMessages[id || ''] || []);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const thread = chatThreads.find(t => t.id === id);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!thread) {
    return <div className="h-full flex items-center justify-center"><p className="text-stone-500">Chat not found</p></div>;
  }

  const handleSend = () => {
    if (!newMessage.trim()) return;
    setMessages(prev => [...prev, {
      id: `m${Date.now()}`,
      senderId: 'c1',
      receiverId: thread.participantId,
      content: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'text' as const,
      read: false,
    }]);
    setNewMessage('');
  };

  return (
    <div className="h-full flex flex-col bg-stone-100">
      <div className="bg-white px-3 pt-2 pb-2 shadow-sm flex items-center gap-2 z-10 shrink-0">
        <button onClick={() => navigate('/chat')} className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
          <ArrowLeft size={16} className="text-stone-600" />
        </button>
        <Avatar name={thread.participantName} size="sm" />
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-stone-800 text-sm truncate">{thread.participantName}</h3>
          <p className="text-[10px] text-green-500 font-medium">Online</p>
        </div>
        <button className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
          <Phone size={14} className="text-stone-600" />
        </button>
        <button className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
          <MoreVertical size={14} className="text-stone-600" />
        </button>
      </div>

      {thread.orderId && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-1.5 flex items-center justify-between shrink-0">
          <span className="text-[10px] text-amber-700 font-medium">📋 Order #{thread.orderId}</span>
          <button onClick={() => navigate(`/order/${thread.orderId}`)} className="text-[10px] text-amber-600 font-semibold">View →</button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map(msg => {
          const isMe = msg.senderId === 'c1';
          return (
            <div key={msg.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn(
                'max-w-[80%] rounded-2xl px-3 py-2',
                isMe ? 'bg-amber-600 text-white rounded-br-md' : 'bg-white text-stone-800 rounded-bl-md shadow-sm'
              )}>
                <p className="text-sm leading-relaxed">{msg.content}</p>
                <p className={cn('text-[9px] mt-0.5 text-right', isMe ? 'text-amber-200' : 'text-stone-400')}>{msg.timestamp}</p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-stone-200 px-3 py-2 flex items-center gap-2 shrink-0">
        <button className="w-9 h-9 rounded-full bg-stone-100 flex items-center justify-center shrink-0">
          <Image size={16} className="text-stone-500" />
        </button>
        <input type="text" placeholder="Type a message..." value={newMessage} onChange={e => setNewMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          className="flex-1 px-3 py-2 bg-stone-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        <button onClick={handleSend} disabled={!newMessage.trim()}
          className={cn('w-9 h-9 rounded-full flex items-center justify-center shrink-0', newMessage.trim() ? 'bg-amber-600 text-white shadow-md' : 'bg-stone-100 text-stone-400')}>
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
