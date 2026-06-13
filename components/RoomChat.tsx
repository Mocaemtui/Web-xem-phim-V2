import { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '@/hooks/useWatchTogether';

interface RoomChatProps {
  messages: ChatMessage[];
  typingUsers: string[];
  onSendMessage: (text: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export default function RoomChat({ messages, typingUsers, onSendMessage, onTyping }: RoomChatProps) {
  const [text, setText] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto scroll to bottom of chat container only, avoiding scrolling the whole webpage
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
    onTyping(true);

    // Clear typing state after 2s of inactivity
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text);
      setText('');
      onTyping(false);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      
      // Dismiss virtual keyboard on submit
      if (typeof document !== "undefined" && document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }
  };


  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden border-0 shadow-none">
      <div className="p-4 border-b border-zinc-900/10 bg-transparent">
        <h3 className="font-semibold text-zinc-200">Trò chuyện trực tiếp</h3>
      </div>
      
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.length === 0 ? (
          <p className="text-zinc-500 text-sm text-center mt-4">Chưa có tin nhắn nào. Hãy gửi lời chào!</p>
        ) : (
          messages.map((msg) => {
            if (msg.isSystem) {
              return (
                <div key={msg.id} className="flex justify-center my-2">
                  <span className="text-xs text-zinc-500 italic bg-zinc-900/50 px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div key={msg.id} className="flex flex-col">
                <div className="flex items-baseline gap-2">
                  <span className="font-medium text-sm text-blue-400">{msg.sender}</span>
                  <span className="text-xs text-zinc-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-zinc-300 text-sm mt-1 bg-zinc-900/40 w-fit py-1.5 px-3 rounded-lg rounded-tl-none break-words max-w-[90%]">
                  {msg.text}
                </p>
              </div>
            );
          })
        )}
        
        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-zinc-500 text-sm italic">
            <span>{typingUsers.join(', ')} đang gõ</span>
            <div className="flex gap-1">
              <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
              <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-transparent border-t border-zinc-900/10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={handleChange}
            placeholder="Nhập tin nhắn..."
            className="flex-1 bg-zinc-900/30 text-zinc-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 transition-shadow"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Gửi
          </button>
        </form>
      </div>
    </div>
  );
}


