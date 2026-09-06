import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Minimize2, Maximize2, RotateCcw, HelpCircle, ShieldCheck, Compass, BookOpen, Film, Gamepad2, Wrench } from 'lucide-react';
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
}

export const AIAssistant: React.FC<AIAssistantProps> = ({
  initialPrompt,
  onClearInitialPrompt,
  currentPage = 'HOME'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `👋 **Welcome! Need assistance with CSSENTIAL?**\n\nI am your official **"Ask for Assistance" Platform Guide & Learning Tutor**. You can ask me almost anything about:\n\n• 🧭 **Website Navigation**: How to navigate Home, Activities, Collection, Games Hub, About Us, and the Researcher Dashboard.\n• 🎮 **How to Play the 9 Games**: Rules and walkthroughs for Sort & Configure, Code Cracker, Sequence, Flashcards, Memory Match, and more.\n• 🎥 **Videos & Manuals**: How to watch demonstration videos, upload your own videos, and print/download academic lab manuals (PDF/Word DOCX).\n• 🛠 **Computer Technician Concepts**: Hardware assembly, POST beep codes, EZ Debug LEDs, RAM dual-channel setup, BIOS/UEFI options, and black-screen troubleshooting.\n\n⚠️ *Academic Integrity Policy: Direct quiz or test answers are restricted so you can genuinely master the skills. I will happily explain the underlying concepts, diagnostic logic, and hints!*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'CSSENTIAL Knowledge Engine'
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Trigger from external component (e.g. Activity hint)
  useEffect(() => {
    if (initialPrompt) {
      setIsOpen(true);
      setIsMinimized(false);
      handleSendPrompt(`I need assistance regarding this scenario: ${initialPrompt}`);
      if (onClearInitialPrompt) onClearInitialPrompt();
    }
  }, [initialPrompt]);

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
        source: response.source
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: 'I encountered a brief connection delay. Please try asking again or select one of the quick assistance topics below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
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
        text: 'Assistance chat history cleared. What topic, game, or navigation tutorial can I help you with today?',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'CSSENTIAL Knowledge Engine'
      }
    ]);
  };

  const quickPrompts = [
    { label: '🧭 How to navigate the website?', query: 'How do I navigate and use the different pages of this website?' },
    { label: '🎮 How to play the 9 games?', query: 'How do I play the games in the Games Hub? Explain the rules.' },
    { label: '📚 What is in Collection?', query: 'What is inside the Collection page and how do I use it?' },
    { label: '🎥 How to watch or upload videos?', query: 'How do I watch or upload demonstration videos on the website?' },
    { label: '📄 How to download lab manuals?', query: 'How do I print or download academic lab manuals in PDF or Word DOCX format?' },
    { label: '🖥️ Troubleshoot: No display / Black screen', query: 'My computer turns on but there is no display on the monitor. What should I check?' },
    { label: '💡 Explain POST beep codes & LEDs', query: 'Explain motherboard POST beep codes and EZ Debug LEDs.' },
    { label: '👥 Who made CSSENTIAL?', query: 'Who are the researchers and developers behind CSSENTIAL?' }
  ];

  return (
    <>
      {/* Floating Launcher Button with "Ask for Assistance" styling */}
      {!isOpen && (
        <button
          id="open-ai-assistant-btn"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 bg-linear-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-full py-3 px-4.5 shadow-xl flex items-center gap-3 transition-all transform hover:scale-105 active:scale-95 cursor-pointer group border-2 border-white/20"
          title="Click to ask for assistance with website navigation, games, lessons, or troubleshooting"
        >
          <div className="relative flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-yellow-300" />
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1 animate-ping"></span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -top-1 -right-1"></span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-black tracking-wide leading-tight uppercase flex items-center gap-1.5">
              <span>Ask for Assistance</span>
              <Sparkles className="w-3 h-3 text-yellow-300 animate-pulse" />
            </span>
            <span className="text-[10px] text-blue-200 font-medium hidden sm:inline-block">
              Navigation • Games • Lessons • Diagnostics
            </span>
          </div>
        </button>
      )}

      {/* Floating Chat Modal */}
      {isOpen && (
        <div
          className={`fixed bottom-4 right-4 z-50 w-[94vw] sm:w-[460px] bg-white rounded-2xl shadow-2xl border border-blue-300 overflow-hidden flex flex-col transition-all duration-200 ${
            isMinimized ? 'h-14' : 'h-[580px]'
          }`}
        >
          {/* Header */}
          <div className="bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white px-4 py-3 flex items-center justify-between shadow-xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-blue-700/80 flex items-center justify-center border border-blue-400 shadow-xs">
                <Bot className="w-5 h-5 text-yellow-300" />
              </div>
              <div>
                <h3 className="text-xs font-black tracking-wide flex items-center gap-1.5 text-white">
                  <span>ASK FOR ASSISTANCE</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <span className="text-[10px] text-blue-200 block font-medium">
                  CSSENTIAL Platform Guide & Learning Tutor
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-blue-200">
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:text-white hover:bg-blue-700/60 rounded-md transition-colors cursor-pointer"
                title="Reset conversation"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 hover:text-white hover:bg-blue-700/60 rounded-md transition-colors cursor-pointer"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:text-white hover:bg-blue-700/60 rounded-md transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Guidance & Academic Integrity Banner */}
              <div className="bg-blue-50 border-b border-blue-200/80 px-3.5 py-1.5 flex items-center justify-between gap-2 text-[11px] text-blue-900 font-medium">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                  <span>Ask about anything in the site! Direct quiz answers restricted.</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 bg-blue-200/60 text-blue-800 rounded-sm font-semibold uppercase tracking-wider shrink-0">
                  {currentPage}
                </span>
              </div>

              {/* Messages Scroll Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50 text-xs">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.sender === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    <div
                      className={`max-w-[90%] p-3.5 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        msg.sender === 'user'
                          ? 'bg-blue-700 text-white rounded-br-xs shadow-xs'
                          : 'bg-white border border-gray-200 text-gray-800 rounded-bl-xs shadow-xs'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 mt-1 px-1">
                      <span className="text-[9px] text-gray-400 font-mono">
                        {msg.timestamp}
                      </span>
                      {msg.source && msg.sender === 'ai' && (
                        <span className="text-[9px] text-blue-600 font-medium bg-blue-50 px-1.5 py-0.2 rounded-xs border border-blue-100">
                          {msg.source.includes('gemini') ? 'AI Model' : 'Platform Guide'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-50 border border-blue-200 p-3 rounded-2xl rounded-bl-xs w-fit shadow-xs animate-pulse">
                    <Bot className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                    <span>Searching CSSENTIAL platform knowledge & curriculum...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompts Chips */}
              <div className="px-3 py-2 bg-white border-t border-gray-200 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {quickPrompts.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(item.query)}
                    disabled={isLoading}
                    className="shrink-0 text-[10px] font-semibold bg-blue-50 hover:bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200 transition-colors cursor-pointer whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Input Form */}
              <form
                onSubmit={handleFormSubmit}
                className="p-3 bg-white border-t border-gray-200 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for assistance with navigation, games, lessons, or hardware..."
                  disabled={isLoading}
                  className="flex-1 px-3.5 py-2 text-xs border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-600 outline-hidden bg-gray-50 text-gray-900 placeholder:text-gray-400"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className={`p-2.5 rounded-xl text-white transition-all ${
                    inputValue.trim() && !isLoading
                      ? 'bg-blue-700 hover:bg-blue-800 cursor-pointer shadow-xs'
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                  title="Send message"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </>
  );
};
