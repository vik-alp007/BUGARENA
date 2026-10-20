import React, { useState } from 'react';
import { assistantApi } from '../api/client.js';
import { Bot, Send, Sparkles, X, Terminal, HelpCircle } from 'lucide-react';

export const AssistantModal = ({ isOpen, onClose, challengeId, challengeTitle }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Greetings Bug Hunter! I am **GlitchAssist**, your deterministic diagnostic copilot.\n\nAsk me about **${challengeTitle || 'this challenge'}**, or select a prompt below:`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'How do I reproduce this bug?',
    'What is the core logic flaw?',
    'Give me an architectural clue',
    'What edge cases should I test?'
  ];

  const handleSend = async (messageText) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await assistantApi.chat({
        challengeId: challengeId || 'sorting-glitch',
        message: textToSend
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.assistant.reply,
          concepts: res.assistant.keyConcepts
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `⚠️ Diagnostic engine error: ${err.message}. Please verify the challenge ID.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 600 }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(0, 240, 255, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 38,
              height: 38,
              borderRadius: '10px',
              background: 'rgba(0, 240, 255, 0.15)',
              border: '1px solid #00f0ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#00f0ff'
            }}>
              <Bot size={20} />
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                GlitchAssist Copilot
                <span style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: '4px', background: 'rgba(0, 240, 255, 0.15)', color: '#00f0ff', border: '1px solid rgba(0, 240, 255, 0.3)' }}>
                  Deterministic Engine
                </span>
              </h4>
              <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                Rule-based diagnostic assistant (No external AI API required)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.3rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Message Thread */}
        <div style={{
          padding: '1.25rem',
          minHeight: '280px',
          maxHeight: '380px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((m, idx) => (
            <div
              key={idx}
              style={{
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '0.85rem 1.15rem',
                borderRadius: '12px',
                background: m.sender === 'user' ? 'linear-gradient(135deg, #0099ff 0%, #00f0ff 100%)' : '#11172e',
                color: m.sender === 'user' ? '#050a17' : '#e2e8f0',
                border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                fontWeight: m.sender === 'user' ? 600 : 400
              }}
            >
              <div style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
              {m.concepts && m.concepts.length > 0 && (
                <div style={{ marginTop: '0.6rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {m.concepts.map((c, i) => (
                    <span key={i} style={{
                      fontSize: '0.7rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      background: 'rgba(0, 240, 255, 0.1)',
                      color: '#00f0ff',
                      border: '1px solid rgba(0, 240, 255, 0.2)'
                    }}>
                      #{c}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '0.65rem 1rem',
              borderRadius: '10px',
              background: '#11172e',
              border: '1px solid rgba(0, 240, 255, 0.2)',
              color: '#00f0ff',
              fontSize: '0.825rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Sparkles size={14} className="spin-fast" />
              Analyzing challenge vectors...
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div style={{
          padding: '0.5rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          display: 'flex',
          gap: '0.4rem',
          overflowX: 'auto'
        }}>
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              disabled={loading}
              style={{
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: '#94a3b8',
                borderRadius: '6px',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#00f0ff';
                e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
              }}
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '1rem 1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          gap: '0.6rem'
        }}>
          <input
            type="text"
            className="form-input"
            placeholder="Ask GlitchAssist about this bug..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
