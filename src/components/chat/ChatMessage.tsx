import React from 'react';
import { Bot, User } from 'lucide-react';

interface Message {
  id: number;
  role: 'assistant' | 'user';
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} gap-3 group`}>
      {isAssistant && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
          <Bot size={18} />
        </div>
      )}
      
      <div className={`max-w-[80%] ${isAssistant ? 'order-2' : 'order-1'}`}>
        <div className={`
          px-4 py-3 rounded-2xl
          ${isAssistant 
            ? 'bg-gray-800 text-gray-100' 
            : 'bg-blue-600 text-white'}
        `}>
          <p className="leading-relaxed text-[15px]">{message.content}</p>
        </div>
        <p className="text-xs text-gray-400 mt-1 px-2">
          {isAssistant ? 'Hanu.ai' : 'You'} • Just now
        </p>
      </div>

      {!isAssistant && (
        <div className="shrink-0 w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center order-3">
          <User size={18} />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;