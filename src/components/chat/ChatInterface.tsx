import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, ArrowDown } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatInterfaceProps {
  onSendMessage: (message: string) => Promise<void>;
  messages: Message[];
  isTyping?: boolean;
  suggestedResponses?: string[];
  onSuggestedResponseClick?: (response: string) => void;
  onSaveConversation?: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  onSendMessage,
  messages,
  isTyping = false,
  suggestedResponses = [],
  onSuggestedResponseClick,
  onSaveConversation
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '' || isSending) return;

    setIsSending(true);
    setInput('');
    
    try {
      await onSendMessage(input);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-gray-50 dark:bg-gray-800 rounded-lg shadow-lg">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
        <div className="flex items-center">
          <Sparkles className="mr-2" size={18} />
          <h2 className="font-semibold">Resume AI Assistant</h2>
        </div>
        {onSaveConversation && (
          <button 
            onClick={onSaveConversation}
            className="text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded"
          >
            Save Conversation
          </button>
        )}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-tl-none'
              }`}
            >
              <div className="flex items-center mb-1">
                {message.sender === 'ai' ? (
                  <Sparkles size={14} className="mr-1 text-blue-500 dark:text-blue-400" />
                ) : (
                  <User size={14} className="mr-1" />
                )}
                <span className="text-xs opacity-70">
                  {message.sender === 'ai' ? 'Resume Assistant' : 'You'}
                </span>
              </div>
              <div className="whitespace-pre-wrap">
                {message.content}
              </div>
            </div>
          </div>
        ))}

        {/* AI Typing Indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3 rounded-tl-none max-w-[80%]">
              <div className="flex items-center mb-1">
                <Sparkles size={14} className="mr-1 text-blue-500 dark:text-blue-400" />
                <span className="text-xs text-gray-500 dark:text-gray-400">Resume Assistant</span>
              </div>
              <div className="flex space-x-1">
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></span>
              </div>
            </div>
          </div>
        )}

        {/* Suggested Responses */}
        {suggestedResponses && suggestedResponses.length > 0 && (
          <div className="flex flex-wrap gap-2 my-2">
            {suggestedResponses.map((response, index) => (
              <button
                key={index}
                onClick={() => onSuggestedResponseClick && onSuggestedResponseClick(response)}
                className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-full text-sm hover:bg-blue-200 dark:hover:bg-blue-800/40 transition-colors"
              >
                {response}
              </button>
            ))}
          </div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button (shows when not at bottom) */}
      <button 
        onClick={scrollToBottom}
        className="absolute bottom-24 right-6 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-opacity opacity-80 hover:opacity-100"
      >
        <ArrowDown size={18} />
      </button>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="border-t border-gray-200 dark:border-gray-700 p-3 flex gap-2">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          className="flex-1 resize-none border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 max-h-[120px] min-h-[40px]"
          rows={1}
        />
        <button
          type="submit"
          disabled={input.trim() === '' || isSending}
          className={`p-2 rounded-lg ${
            input.trim() === '' || isSending
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatInterface; 