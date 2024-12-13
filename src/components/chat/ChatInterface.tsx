import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Smile, Pencil } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useParams, useNavigate } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import { Thread, createThread, updateThread } from '../../services/threadService';
import { useThreads } from '../../contexts/ThreadContext';

interface ApiMessage {
  content: string;
  role: 'assistant' | 'user';
  tool_calls?: any;
  name?: string;
  tool_call_id?: string;
}

interface ApiResponse {
  messages: ApiMessage[];
  tasks: Record<string, any>;
}

interface ChatInterfaceProps {
  onTasksUpdate?: (tasks: Record<string, any>) => void;
}

const WELCOME_MESSAGE = {
  id: 0,
  role: 'assistant',
  content: 'Hello! 👋 I\'m your AI assistant. How can I help you today?'
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onTasksUpdate }) => {
  const { currentUser } = useAuth();
  const { threadId } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('New Chat');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [messages, setMessages] = useState<{
    id: number;
    role: string;
    content: string;
  }[]>([WELCOME_MESSAGE]);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Record<string, any>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const { addThread, updateThreadInState, threads } = useThreads();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadThreadMessages = async () => {
      if (!threadId) return;
      
      setIsLoadingMessages(true);
      setMessageError(null);
      
      try {
        const response = await fetch('http://127.0.0.1:8080/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: '',
            thread_id: threadId
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to load messages');
        }

        const data: ApiResponse = await response.json();
        
        // Filter out messages without content
        const validMessages = data.messages.filter(msg => msg.content && msg.content.trim() !== '');
        
        // Convert API messages to our message format
        const formattedMessages = validMessages.map((msg, index) => ({
          id: index + 1,
          role: msg.role,
          content: msg.content
        }));

        // Update tasks from response
        setTasks(data.tasks || {});

        // Always include welcome message at the start
        setMessages([WELCOME_MESSAGE, ...formattedMessages]);
      } catch (err) {
        console.error('Failed to load messages:', err);
        setMessageError('Failed to load messages');
        // Reset to welcome message on error
        setMessages([WELCOME_MESSAGE]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadThreadMessages();
  }, [threadId]);

  useEffect(() => {
    if (threadId) {
      const currentThread = threads.find(thread => thread.id === threadId);
      if (currentThread) {
        setTitle(currentThread.title);
      }
    } else {
      setTitle('New Chat');
    }
  }, [threadId, threads]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentUser) return;

    let currentThreadId = threadId;

    // Create new thread if needed
    if (!currentThreadId) {
      try {
        const newThread = await createThread(
          currentUser.uid,
          message.length > 30 ? message.slice(0, 30) + '...' : message
        );
        addThread(newThread);
        currentThreadId = newThread.id;
        navigate(`/chat/${newThread.id}`);
      } catch (err) {
        console.error('Failed to create thread:', err);
        return;
      }
    }

    // Now make the API call with the guaranteed thread ID
    try {
      const response = await fetch('http://127.0.0.1:8080/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: message.trim(),
          thread_id: currentThreadId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data: ApiResponse = await response.json();
      
      // Filter out messages without content
      const validMessages = data.messages.filter(msg => msg.content && msg.content.trim() !== '');
      
      // Convert API messages to our message format
      const formattedMessages = validMessages.map((msg, index) => ({
        id: index + 1,
        role: msg.role,
        content: msg.content
      }));

      // Update tasks from response
      setTasks(data.tasks || {});

      // Always include welcome message at the start
      setMessages([WELCOME_MESSAGE, ...formattedMessages]);
      setMessage('');

      // Update thread date after successful message
      try {
        await updateThread(currentThreadId, {});  // Only update date
        updateThreadInState(currentThreadId, { date: new Date().toISOString() });
      } catch (err) {
        console.error('Failed to update thread date:', err);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages([WELCOME_MESSAGE]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTitleEdit = () => {
    setIsEditingTitle(true);
    setTimeout(() => {
      titleInputRef.current?.focus();
      titleInputRef.current?.select();
    }, 0);
  };

  const handleTitleSave = async () => {
    setIsEditingTitle(false);
    
    if (!threadId || !title.trim()) return;

    try {
      await updateThread(threadId, { 
        title: title.trim(),
        date: new Date().toISOString()
      });
      
      updateThreadInState(threadId, { 
        title: title.trim(),
        date: new Date().toISOString()
      });
    } catch (err) {
      console.error('Failed to update thread title:', err);
      // Optionally show error to user
    }
  };

  const handleTitleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    }
  };

  const clearMessages = () => {
    setMessages([WELCOME_MESSAGE]);
    setTitle('New Chat');
  };

  useEffect(() => {
    if (threadId === undefined) {
      clearMessages();
    }
  }, [threadId]);

  useEffect(() => {
    if (onTasksUpdate) {
      onTasksUpdate(tasks);
    }
  }, [tasks, onTasksUpdate]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-gray-950">
      {/* Chat Header */}
      <div className="border-b border-gray-800/60 backdrop-blur-xl bg-gray-900/30 p-4 z-10">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyPress}
              className="text-lg font-medium bg-gray-800 text-gray-100 px-2 py-1 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
            />
          ) : (
            <>
              <h2 className="text-lg font-medium text-gray-100">{title}</h2>
              <button
                onClick={handleTitleEdit}
                className="p-1 hover:bg-gray-800 rounded transition-colors text-gray-400 hover:text-white"
              >
                <Pencil size={16} />
              </button>
            </>
          )}
          <p className="text-sm text-gray-400 ml-auto">Started 2 minutes ago</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <div className="max-w-3xl mx-auto space-y-6 px-4 py-6">
          {isLoadingMessages ? (
            <div className="text-center text-gray-400">Loading messages...</div>
          ) : messageError ? (
            <div className="text-center text-red-400">{messageError}</div>
          ) : (
            <>
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </div>
      
      {/* Input Area */}
      <div className="border-t border-gray-800/60 bg-gray-900/30 backdrop-blur-xl p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end bg-gray-800 rounded-xl shadow-lg border border-gray-700/50">
            <button className="absolute bottom-3 left-3 p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white">
              <Smile size={20} />
            </button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Message Hanu.ai..."
              className="w-full pl-14 pr-24 py-4 bg-transparent border-none focus:ring-0 resize-none max-h-48 text-base placeholder-gray-500"
              rows={1}
              style={{ minHeight: '56px' }}
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white">
                <Paperclip size={20} />
              </button>
              <button 
                onClick={handleSendMessage}
                className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;