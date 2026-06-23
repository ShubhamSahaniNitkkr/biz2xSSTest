import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { chatApi } from '../api/client';
import { IconBot, IconChat, IconClose, IconSend } from './Icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  sources?: { field: string; value: unknown }[];
  refused?: boolean;
}

const SUGGESTION_POOL = [
  'How much HRA did I receive?',
  'Why is my net salary lower this month?',
  'What deductions were applied?',
  'What is my year-to-date net pay?',
  'How can I save more tax under 80C?',
  'What proofs are still pending?',
  'Show my gross vs net breakdown',
];

function pickSuggestions(exclude: string, offset: number): string[] {
  const normalized = exclude.trim().toLowerCase();
  const pool = SUGGESTION_POOL.filter((s) => s.toLowerCase() !== normalized);
  const start = offset % pool.length;
  const rotated = [...pool.slice(start), ...pool.slice(0, start)];
  return rotated.slice(0, 3);
}

export default function StickyChatbot({ expanded = false }: { expanded?: boolean }) {
  const location = useLocation();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(expanded);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hi! I'm your Financial Wellness assistant. Ask me anything about your payslip, deductions, or tax savings — I'll answer using only your data.",
    },
  ]);
  const [suggestions, setSuggestions] = useState<string[]>(() => pickSuggestions('', 0));
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const isChatRoute = location.pathname === '/chat';

  useEffect(() => {
    if (expanded) setOpen(true);
  }, [expanded]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, open, suggestions]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [open]);

  useEffect(() => {
    if (!open || expanded) return;

    function handleClickOutside(e: MouseEvent) {
      if (widgetRef.current && !widgetRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, expanded]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setSuggestions([]);

    const userMsg: Message = { id: `u-${Date.now()}`, role: 'user', text: trimmed };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatApi.ask(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: result.answer,
          sources: result.sources,
          refused: result.refused,
        },
      ]);
      setSuggestions(pickSuggestions(trimmed, messages.length + 1));
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: 'assistant',
          text: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
          refused: true,
        },
      ]);
      setSuggestions(pickSuggestions(trimmed, messages.length + 1));
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  if (isChatRoute && !expanded) return null;

  return (
    <div
      ref={widgetRef}
      className={`chatbot-widget ${open ? 'chatbot-open' : ''} ${expanded ? 'chatbot-expanded' : ''}`}
    >
      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <IconBot size={22} />
              </div>
              <div>
                <h3>Wellness Assistant</h3>
                <span className="chatbot-status">
                  <span className="status-dot" />
                  Online · Grounded in your data
                </span>
              </div>
            </div>
            {!expanded && (
              <button type="button" className="btn-icon" onClick={() => setOpen(false)} aria-label="Close chat">
                <IconClose size={18} />
              </button>
            )}
          </div>

          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chat-bubble-wrap chat-${msg.role}`}>
                {msg.role === 'assistant' && (
                  <div className="chat-bubble-avatar">
                    <IconBot size={16} />
                  </div>
                )}
                <div className={`chat-bubble ${msg.refused ? 'chat-refused' : ''}`}>
                  <p>{msg.text}</p>
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="chat-sources">
                      {msg.sources.map((s) => (
                        <span key={s.field} className="source-chip">
                          {s.field}: {String(s.value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble-wrap chat-assistant">
                <div className="chat-bubble-avatar">
                  <IconBot size={16} />
                </div>
                <div className="chat-bubble chat-typing">
                  <div className="typing-dots">
                    <span />
                    <span />
                    <span />
                  </div>
                  <span className="typing-label">Analyzing your payroll data...</span>
                </div>
              </div>
            )}

            {!loading && suggestions.length > 0 && !expanded && (
              <div
                className="chatbot-suggestions"
                style={{ padding: '0.25rem 0 0', marginLeft: '2.25rem', maxWidth: '88%' }}
              >
                <div className="chatbot-suggestions-chips">
                  {suggestions.map((s) => (
                    <button key={s} type="button" className="suggestion-chip" onClick={() => sendMessage(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {!loading && suggestions.length > 0 && expanded && (
            <div className="chatbot-suggestions">
              <p className="chatbot-suggestions-label">Suggested questions</p>
              <div className="chatbot-suggestions-chips">
                {suggestions.map((s) => (
                  <button key={s} type="button" className="suggestion-chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-composer">
            <textarea
              ref={inputRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about your salary..."
              disabled={loading}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim()}
              aria-label="Send message"
            >
              <IconSend size={18} />
            </button>
          </div>
        </div>
      )}

      {!expanded && (
        <button
          type="button"
          className="chatbot-fab"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? 'Close chat' : 'Open chat'}
        >
          {open ? <IconClose size={24} /> : <IconChat size={24} />}
          {!open && <span className="fab-pulse" />}
        </button>
      )}
    </div>
  );
}
