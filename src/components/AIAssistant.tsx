import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageSquare, Send, X, RotateCcw, Minimize2, Maximize2 } from 'lucide-react';
import { api } from '../services/api';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
}

interface AIAssistantProps {
  initialPrompt?: string | null;
  onClearInitialPrompt?: () => void;
  currentPage?: string;
  onOpenCommunityChat?: () => void;
  hideAIAssistant?: boolean;
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  currentPage = 'HOME',
  onOpenCommunityChat,
  hideAIAssistant = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Hello! I am your **ASK CSSENTIAL** technical assistant. You can ask me questions about hardware assembly, BIOS/UEFI configuration, diagnostic troubleshooting, laboratory manuals, or platform navigation!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'CSSENTIAL Assistant'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // If on activity player or games hub, automatically close if it was open
  useEffect(() => {
    if (hideAIAssistant && isOpen) {
      setIsOpen(false);
    }
  }, [hideAIAssistant, isOpen]);

  // Trigger from external component
  useEffect(() => {
    if (initialPrompt && !hideAIAssistant) {
      setIsOpen(true);
      setIsMinimized(false);
      handleSendPrompt(`I need assistance regarding this scenario: ${initialPrompt}`);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt, hideAIAssistant]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized]);

  const handleSendPrompt = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await api.askAI(query, `Current View: ${currentPage}`, historyPayload, currentPage);
      const aiMessage: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: response.source || 'CSSENTIAL Assistant'
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'I encountered a brief connection delay. Please ask your question again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'CSSENTIAL Assistant'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendPrompt(inputValue);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'welcome-reset',
        sender: 'ai',
        text: 'Chat history cleared. How can I assist you today with computer hardware or CSSENTIAL modules?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'CSSENTIAL Assistant'
      }
    ]);
  };

  const quickPrompts = [
    { label: 'Virtual PC Simulator', query: 'How do I play the Virtual PC Hardware Assembly Lab Simulator?' },
    { label: 'Black Screen / No POST', query: 'How do I troubleshoot a PC with power but no display?' },
    { label: 'EZ Debug LEDs', query: 'What do the motherboard EZ Debug LEDs (CPU, DRAM, VGA, BOOT) indicate?' },
    { label: 'RAM Slots A2 & B2', query: 'Why install dual-channel RAM in slots A2 and B2?' },
    { label: 'UEFI / BIOS Setup', query: 'How do I configure boot priority and enable XMP in BIOS?' }
  ];

  return (
    <>
      {/* AI ASSISTANT POPUP WINDOW */}
      {isOpen && !hideAIAssistant && (
        <div
          className={`fixed bottom-28 right-4 z-50 w-[92vw] sm:w-[420px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in zoom-in-95 ${
            isMinimized ? 'h-14' : 'h-[520px] max-h-[80vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white px-4 py-3 flex items-center justify-between shadow-xs shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-700/80 flex items-center justify-center text-yellow-300">
                <Bot className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                  <span>ASK CSSENTIAL</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-blue-200">Hardware &amp; Platform Learning Assistant</p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-blue-200">
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                title="Clear conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
                title="Close assistant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages Discussion List */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-slate-50 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[88%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-blue-700 text-white rounded-br-xs'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 px-1">
                      <span className="text-[9px] text-gray-400 font-mono">
                        {msg.timestamp}
                      </span>
                      {msg.source && msg.sender === 'ai' && (
                        <span className="text-[9px] text-blue-600 font-medium">
                          • {msg.source}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-900 bg-blue-50 border border-blue-200 px-3 py-2 rounded-xl w-fit">
                    <span className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.3s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:-0.15s]"></span>
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                    </span>
                    <span className="font-medium text-xs">Assistant is thinking...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions */}
              <div className="px-2.5 py-1.5 bg-white border-t border-gray-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(item.query)}
                    disabled={isLoading}
                    className="shrink-0 text-[10px] font-medium bg-gray-100 hover:bg-blue-50 hover:text-blue-800 text-gray-700 px-2.5 py-1 rounded-full border border-gray-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Simple Input Form */}
              <form
                onSubmit={handleFormSubmit}
                className="p-2.5 bg-white border-t border-gray-200 flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask CSSENTIAL about computer hardware..."
                  disabled={isLoading}
                  className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-600 outline-hidden bg-gray-50 text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2 rounded-lg text-white transition-all ${
                    inputValue.trim() && !isLoading
                      ? 'bg-blue-700 hover:bg-blue-800 cursor-pointer'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* TWO CIRCULAR BUTTONS IN BOTTOM RIGHT CORNER BESIDE EACH OTHER */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-3 select-none pointer-events-auto">
        {/* BUTTON 1: "ASK CSSENTIAL" CIRCLE (HIDDEN DURING ACTIVITIES / GAMES) */}
        {!hideAIAssistant && (
          <button
            id="ask-cssential-circle-btn"
            onClick={() => setIsOpen(prev => !prev)}
            className={`w-20 h-20 rounded-full bg-blue-700 hover:bg-blue-800 text-white shadow-xl flex flex-col items-center justify-center p-1.5 text-center border-4 border-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 relative group ${
              isOpen ? 'ring-4 ring-blue-300 ring-offset-2' : ''
            }`}
            title="ASK CSSENTIAL"
            aria-label="ASK CSSENTIAL"
          >
            <Bot className="w-5 h-5 text-yellow-300 mb-0.5 group-hover:scale-110 transition-transform shrink-0" />
            <span className="text-[9px] font-black uppercase tracking-wider text-white leading-tight text-center">
              ASK<br />CSSENTIAL
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute top-1 right-1 border-2 border-white"></span>
          </button>
        )}

        {/* BUTTON 2: "CHAT BOX" CIRCLE (SAME DESIGN BESIDE IT) */}
        <button
          id="chat-box-circle-btn"
          onClick={onOpenCommunityChat}
          className="w-20 h-20 rounded-full bg-indigo-700 hover:bg-indigo-800 text-white shadow-xl flex flex-col items-center justify-center p-1.5 text-center border-4 border-white cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 relative group"
          title="Chat Box"
          aria-label="Chat Box"
        >
          <MessageSquare className="w-5 h-5 text-indigo-200 mb-0.5 group-hover:scale-110 transition-transform shrink-0" />
          <span className="text-[9px] font-black uppercase tracking-wider text-white leading-tight text-center">
            CHAT<br />BOX
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute top-1 right-1 border-2 border-white animate-pulse"></span>
        </button>
      </div>
    </>
  );
};
