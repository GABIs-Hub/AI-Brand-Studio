import React, { useState, useRef, useEffect } from 'react';
import { BrandBible, ChatMessage } from '../types';
import { X, Send, Bot, User, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

interface AiBrandAssistantProps {
  brand: BrandBible | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AiBrandAssistant({ brand, isOpen, onClose }: AiBrandAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: brand
        ? `Hello! I'm your AI Brand Director for **${brand.brandName}**. How can I help you refine your brand bible, write social media copy, or explore new brand taglines?`
        : `Hello! I'm your AI Brand Director. Describe your business or ask any brand strategy questions to get started!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ sender: m.sender, text: m.text })),
          brandContext: brand,
        }),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      const assistantMsg: ChatMessage = {
        id: 'ast-' + Date.now(),
        sender: 'assistant',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: `Sorry, I ran into an error processing your request: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPrompt = (promptText: string) => {
    setInputText(promptText);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white border-l border-[#1A1A1A] flex flex-col shadow-2xl">
      {/* Drawer Header */}
      <div className="p-6 bg-[#1A1A1A] text-white flex items-center justify-between border-b border-[#1A1A1A]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[11px] uppercase tracking-[0.3em] text-white flex items-center gap-2">
              <span>Brand Director</span>
              <span className="text-[8px] font-mono px-1.5 py-0.5 border border-white/30 text-white/50">
                gemini-3.5-flash
              </span>
            </h3>
            <p className="text-[9px] uppercase tracking-widest text-white/50 mt-1">
              {brand ? `Context: ${brand.brandName}` : 'Strategy Assistant'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/20"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      {brand && (
        <div className="bg-[#F9F7F2] p-4 border-b border-[#1A1A1A] flex items-center gap-3 overflow-x-auto text-[9px] uppercase tracking-widest font-bold scrollbar-none">
          <span className="text-[#1A1A1A] shrink-0 opacity-50">Ask AI:</span>
          <button
            onClick={() => handleQuickPrompt('Suggest 5 alternative taglines for our brand mission.')}
            className="px-3 py-1.5 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white shrink-0 transition-colors"
          >
            5 New Taglines
          </button>
          <button
            onClick={() => handleQuickPrompt('Write a 150-word product launch Instagram caption in our brand voice.')}
            className="px-3 py-1.5 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white shrink-0 transition-colors"
          >
            Launch Caption
          </button>
          <button
            onClick={() => handleQuickPrompt('How should we apply our color palette to a dark mode app interface?')}
            className="px-3 py-1.5 border border-[#1A1A1A] text-[#1A1A1A] hover:bg-[#1A1A1A] hover:text-white shrink-0 transition-colors"
          >
            Dark Mode Palette
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center shrink-0 border ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A]'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] p-4 space-y-2 border ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A]'
                  : 'bg-white text-[#1A1A1A] border-[#1A1A1A] border-dashed'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed font-serif italic text-sm">{msg.text}</p>
              <span
                className={`text-[9px] uppercase tracking-widest font-bold block text-right opacity-50 ${
                  msg.sender === 'user' ? 'text-white' : 'text-[#1A1A1A]'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] bg-[#F9F7F2] p-4 border border-[#1A1A1A] w-fit">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Director is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-[#1A1A1A] flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask brand strategist AI..."
          className="flex-1 bg-transparent border-b border-dashed border-[#1A1A1A] px-2 py-3 font-serif italic text-sm focus:outline-hidden focus:border-solid transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-3 border border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#2C3333] transition-colors disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
