import React from 'react';
import { Bot, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

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
          <div className="leading-relaxed text-[15px] prose prose-invert max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // Override default styling for code blocks
                code({ node, inline, className, children, ...props }) {
                  return (
                    <code
                      className={`${inline ? 'bg-gray-700 px-1 py-0.5 rounded text-sm' : 'block bg-gray-700/50 p-4 rounded-lg overflow-x-auto'} ${className || ''}`}
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                // Style links
                a({ node, children, ...props }) {
                  return (
                    <a
                      className="text-blue-400 hover:text-blue-300 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                      {...props}
                    >
                      {children}
                    </a>
                  );
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
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