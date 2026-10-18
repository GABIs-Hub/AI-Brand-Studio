import React, { useState, useRef, useEffect } from 'react';
import { BrandBible, ChatMessage } from '../types';
import { X, Send, Bot, User, Sparkles, RefreshCw, MessageSquare } from 'lucide-react';

interface AiBrandAssistantProps {
  brand: BrandBible | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AiBrandAssistant({ brand, isOpen, onClose }: AiBrandAssistantProps) {
  const [selectedProvider, setSelectedProvider] = useState<'auto' | 'openai' | 'anthropic' | 'gemini'>('auto');
  const PROVIDER_LABELS: Record<string, string> = {
    auto: 'Auto (Cascade)',
    openai: 'ChatGPT',
    anthropic: 'Claude',
    gemini: 'Gemini',
  };
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'init-' + (brand?.id || 'default'),
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

  // Synchronize and reset director conversation whenever the active brand changes
  useEffect(() => {
    if (brand) {
      setMessages([
        {
          id: 'init-' + brand.id,
          sender: 'assistant',
          text: `Hello! I'm your AI Brand Director for **${brand.brandName}**. How can I help you refine your brand bible, write social media copy, or explore new brand taglines?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setInputText('');
      setIsLoading(false);
    }
  }, [brand?.id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // AI Director should ONLY be active and visible when a brand is active and drawer is opened
  if (!isOpen || !brand) return null;

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
          provider: selectedProvider,
        }),
      });

      const _contentType = response.headers.get('content-type') || '';
      if (_contentType.includes('text/html')) {
        throw new Error('Server is currently unavailable or restarting. Please try again in a few seconds.');
      }
      if (!response.ok) {
        let errText = 'Failed to receive chat response.';
        try {
          const errData = await response.json();
          if (errData?.error) errText = errData.error;
        } catch {
          // ignore fallback
        }
        throw new Error(errText);
      }

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
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[420px] bg-white dark:bg-[#181816] border-l border-[#1A1A1A] dark:border-[#F9F7F2]/20 flex flex-col shadow-2xl transition-colors duration-300">
      {/* Drawer Header */}
      <div className="p-6 bg-[#1A1A1A] dark:bg-[#111110] text-white flex items-center justify-between border-b border-[#1A1A1A]">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-white/20 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[11px] uppercase tracking-[0.3em] text-white flex items-center gap-2">
              <span>Brand Director</span>
              <span className="text-[7px] font-mono px-1.5 py-0.5 border border-white/30 text-white/70 bg-white/5">
                {PROVIDER_LABELS[selectedProvider]}
              </span>
            </h3>
            <p className="text-[9px] uppercase tracking-widest text-white/50 mt-1">
              {brand ? `Context: ${brand.brandName}` : 'Strategy Assistant'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 text-white/50 hover:text-white transition-colors border border-transparent hover:border-white/20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* AI Engine Selection Bar */}
      <div className="bg-[#F9F7F2] dark:bg-[#20201E] border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 p-4 flex flex-col gap-2">
        <span className="text-[8px] uppercase tracking-widest font-bold text-[#1A1A1A] dark:text-[#F9F7F2] opacity-60">
          AI Engine:
        </span>
        <div className="grid grid-cols-4 gap-1.5">
          {(['auto', 'openai', 'anthropic', 'gemini'] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setSelectedProvider(p)}
              className={`py-1.5 text-[8px] uppercase tracking-widest font-black border transition-all text-center rounded-xl cursor-pointer ${
                selectedProvider === p
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2]'
                  : 'bg-white text-[#1A1A1A] border-gray-300 dark:border-gray-300 dark:bg-[#181816] dark:text-zinc-400 dark:border-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-900'
              }`}
              title={`${p === 'auto' ? 'Automatic fallback cascade' : p === 'openai' ? 'ChatGPT (OpenAI)' : p === 'anthropic' ? 'Anthropic Claude' : 'Google Gemini'} engine`}
            >
              {PROVIDER_LABELS[p].replace(' (Cascade)', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Quick Prompts */}
      {brand && (
        <div className="bg-[#F9F7F2] dark:bg-[#1C1C1A] p-4 border-b border-[#1A1A1A] dark:border-[#F9F7F2]/20 flex items-center gap-3 overflow-x-auto text-[9px] uppercase tracking-widest font-bold scrollbar-none shrink-0">
          <span className="text-[#1A1A1A] dark:text-[#F9F7F2] shrink-0 opacity-50">Ask AI:</span>
          <button
            onClick={() => handleQuickPrompt('Suggest 5 alternative taglines for our brand mission.')}
            className="px-3 py-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A] shrink-0 transition-colors cursor-pointer"
          >
            5 New Taglines
          </button>
          <button
            onClick={() => handleQuickPrompt('Write a 150-word product launch Instagram caption in our brand voice.')}
            className="px-3 py-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A] shrink-0 transition-colors cursor-pointer"
          >
            Launch Caption
          </button>
          <button
            onClick={() => handleQuickPrompt('How should we apply our color palette to a dark mode app interface?')}
            className="px-3 py-1.5 border border-[#1A1A1A] dark:border-[#F9F7F2]/30 text-[#1A1A1A] dark:text-[#F9F7F2] hover:bg-[#1A1A1A] hover:text-white dark:hover:bg-[#F9F7F2] dark:hover:text-[#1A1A1A] shrink-0 transition-colors cursor-pointer"
          >
            Dark Mode Palette
          </button>
        </div>
      )}

      {/* Messages Thread */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-white dark:bg-[#181816]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-4 ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-8 h-8 flex items-center justify-center shrink-0 border ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:border-[#F9F7F2]'
                  : 'bg-[#F9F7F2] text-[#1A1A1A] border-[#1A1A1A] dark:bg-[#20201E] dark:text-[#F9F7F2] dark:border-[#F9F7F2]/20'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[80%] p-4 space-y-2 border ${
                msg.sender === 'user'
                  ? 'bg-[#1A1A1A] text-white border-[#1A1A1A] dark:bg-[#20201E] dark:text-[#F9F7F2] dark:border-zinc-800'
                  : 'bg-white text-[#1A1A1A] border-[#1A1A1A] border-dashed dark:bg-[#181816] dark:text-[#F9F7F2] dark:border-zinc-700'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed font-display text-sm">{msg.text}</p>
              <span
                className={`text-[9px] uppercase tracking-widest font-bold block text-right opacity-50 ${
                  msg.sender === 'user' ? 'text-white' : 'text-[#1A1A1A] dark:text-[#F9F7F2]'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest font-bold text-[#1A1A1A] bg-[#F9F7F2] p-4 border border-[#1A1A1A] dark:bg-[#20201E] dark:text-[#F9F7F2] dark:border-zinc-700 w-fit">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>Director is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="p-4 bg-white dark:bg-[#111110] border-t border-[#1A1A1A] dark:border-zinc-800 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask brand strategist AI..."
          className="flex-1 bg-transparent border-b border-dashed border-[#1A1A1A] dark:border-zinc-700 px-2 py-3 font-display text-sm text-[#1A1A1A] dark:text-[#F9F7F2] focus:outline-hidden focus:border-solid transition-all"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-3 border border-[#1A1A1A] bg-[#1A1A1A] text-white hover:bg-[#2C3333] transition-colors disabled:opacity-50 cursor-pointer dark:border-[#F9F7F2]/20 dark:bg-[#F9F7F2] dark:text-[#1A1A1A] dark:hover:bg-white"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
