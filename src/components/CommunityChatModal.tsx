import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Shield, Flag, Trash2, CheckCircle2, User, RefreshCw, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';

interface CommunityChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName?: string;
  yearSection?: string;
}

export const CommunityChatModal: React.FC<CommunityChatModalProps> = ({
  isOpen,
  onClose,
  studentId,
  studentName = 'Student',
  yearSection = 'General Section'
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isInstructor, setIsInstructor] = useState(false);
  const [sending, setSending] = useState(false);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollIntervalRef = useRef<any>(null);

  const fetchMessages = async () => {
    try {
      const msgs = await api.getChatMessages();
      setMessages(msgs);
    } catch (err) {
      console.error('Error fetching chat messages:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      return;
    }

    fetchMessages();
    pollIntervalRef.current = setInterval(fetchMessages, 4000);

    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = inputText.trim();
    if (!clean || sending) return;

    setSending(true);
    try {
      const newMsg = await api.sendChatMessage({
        student_id: studentId,
        student_name: studentName,
        year_section: yearSection,
        text: clean,
        is_instructor: isInstructor
      });
      setMessages(prev => [...prev, newMsg]);
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleReport = async (msgId: string) => {
    if (reportedIds.includes(msgId)) return;
    await api.reportChatMessage(msgId);
    setReportedIds(prev => [...prev, msgId]);
    setFeedback('Message reported to instructors for moderation review.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = async (msgId: string) => {
    await api.deleteChatMessage(msgId);
    setMessages(prev => prev.filter(m => m.id !== msgId));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/70 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200 flex flex-col h-[640px] max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Chat Header */}
        <div className="bg-linear-to-r from-blue-900 to-indigo-900 text-white px-5 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center text-white shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>Student &amp; Faculty Community Discussion</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </h3>
              <p className="text-[11px] text-blue-200">
                Live Technical Q&amp;A, Lab Collaborations &amp; Troubleshooting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMessages}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-colors cursor-pointer"
              title="Refresh messages"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-blue-100 hover:text-white transition-colors cursor-pointer"
              title="Close discussion room"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Status Feedback Notice */}
        {feedback && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{feedback}</span>
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
          {messages.length === 0 ? (
            <div className="py-16 text-center text-gray-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto text-gray-300" />
              <p className="text-xs font-semibold">No messages yet. Be the first to start the discussion!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isOwn = msg.student_id === studentId;
              const isReported = reportedIds.includes(msg.id);

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 px-1">
                    <span className="font-black text-gray-800 flex items-center gap-1">
                      {msg.is_instructor && (
                        <span className="bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-black text-[9px] flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" />
                          INSTRUCTOR
                        </span>
                      )}
                      {msg.student_name}
                    </span>
                    {msg.year_section && (
                      <span className="text-gray-400">({msg.year_section})</span>
                    )}
                    <span className="text-gray-400">•</span>
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm shadow-2xs leading-relaxed relative group ${
                      msg.is_instructor
                        ? 'bg-purple-50 border border-purple-200 text-purple-950 font-medium'
                        : isOwn
                        ? 'bg-blue-700 text-white rounded-br-xs'
                        : 'bg-white border border-gray-200 text-gray-900 rounded-bl-xs'
                    }`}
                  >
                    <p className="whitespace-pre-wrap wrap-break-word">{msg.text}</p>

                    {/* Actions menu on hover */}
                    <div className={`absolute top-1 ${isOwn ? '-left-14' : '-right-14'} opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-md shadow-xs border border-gray-200 text-gray-600`}>
                      {!isOwn && (
                        <button
                          onClick={() => handleReport(msg.id)}
                          disabled={isReported}
                          title={isReported ? 'Reported' : 'Report message'}
                          className="p-1 hover:text-amber-600 rounded cursor-pointer"
                        >
                          <Flag className={`w-3 h-3 ${isReported ? 'text-amber-500' : ''}`} />
                        </button>
                      )}
                      {(isOwn || isInstructor) && (
                        <button
                          onClick={() => handleDelete(msg.id)}
                          title="Delete message"
                          className="p-1 hover:text-red-600 rounded cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-white border-t border-gray-200 p-3.5 shrink-0 space-y-2">
          {/* Faculty / Instructor toggle */}
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-500 font-medium">
              Posting as: <strong className="text-gray-800">{studentName}</strong> ({yearSection})
            </span>

            <label className="flex items-center gap-1.5 cursor-pointer text-gray-600 select-none hover:text-purple-900">
              <input
                type="checkbox"
                checked={isInstructor}
                onChange={(e) => setIsInstructor(e.target.checked)}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="font-bold text-[10px] uppercase text-purple-800">Faculty / Teacher Badge</span>
            </label>
          </div>

          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your technical question or comment here..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 bg-gray-50/50"
              maxLength={400}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sending}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                inputText.trim() && !sending
                  ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>{sending ? 'Sending...' : 'Send'}</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
