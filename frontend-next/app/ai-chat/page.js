'use client';
export const dynamic = 'force-dynamic';

import React, { useState, useRef, useEffect } from 'react';
import { aiService } from '../lib/api';
import PageTitle from '../components/layout/PageTitle';
import './AiChat.css';

function renderMarkdown(text) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    const lines = part.split('\n');
    return lines.map((line, j) => (
      <React.Fragment key={`${i}-${j}`}>
        {j > 0 && <br />}
        {line}
      </React.Fragment>
    ));
  });
}

export default function AIChatPage() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Hi! I'm your ShelfToTales support assistant. I can help with book recommendations, order questions, account info, and more. How can I help you today?",
    recommendations: []
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg, recommendations: [] }]);
    setLoading(true);
    try {
      const res = await aiService.chat(userMsg);
      const reply = res.data?.reply || "I'm not sure how to help with that. Could you try rephrasing your question?";
      const recommendations = res.data?.recommendations || [];
      setMessages(prev => [...prev, { role: 'assistant', content: reply, recommendations }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again.", recommendations: [] }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="page-content" style={{ background: '#f9f7f4', minHeight: '100vh' }}>
      <PageTitle parentPage="Support" childPage="AI Customer Support"/>
      <div className="container py-4" style={{ maxWidth: 700 }}>
        <div style={{ background: '#fff', borderRadius: 20, boxShadow: '0 4px 20px rgba(0,0,0,0.04)', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 250px)', minHeight: 400 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
                <div style={{ maxWidth: '80%' }}>
                  <div className="msg-content" style={{ padding: '12px 16px', borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px', background: msg.role === 'user' ? 'linear-gradient(135deg, #eaa451, #e58c23)' : '#f5f3f0', color: msg.role === 'user' ? '#fff' : '#333', fontSize: '0.9rem', lineHeight: 1.6 }}>
                    {renderMarkdown(msg.content)}
                  </div>
                  {msg.recommendations && msg.recommendations.length > 0 && (
                    <div className="ai-rec-cards">
                      {msg.recommendations.map((rec, j) => (
                        <div key={j} className="ai-rec-card" onClick={() => window.open(`/shop-detail/${rec.bookId}`, '_blank')}>
                          <img src={rec.coverUrl || '/images/book-default.jpg'} alt={rec.title} />
                          <div className="ai-rec-card-info">
                            <span className="ai-rec-card-title">{rec.title}</span>
                            {rec.author && <span className="ai-rec-card-author">{rec.author}</span>}
                            {rec.reason && <span className="ai-rec-card-reason">{rec.reason}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && <div style={{ display: 'flex', gap: 4, padding: '12px 16px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd', animation: 'pulse 1s infinite' }}/><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd', animation: 'pulse 1s infinite 0.2s' }}/><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ddd', animation: 'pulse 1s infinite 0.4s' }}/></div>}
            <div ref={endRef}/>
          </div>
          {/* Input */}
          <form onSubmit={send} style={{ display: 'flex', gap: 8, padding: '1rem 1.5rem', borderTop: '1px solid #f0ede8' }}>
            <input type="text" value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about orders, books, or anything else..." style={{ flex: 1, padding: '12px 16px', border: '1px solid #e8e5e0', borderRadius: 12, fontSize: '0.9rem', outline: 'none' }}/>
            <button type="submit" disabled={loading || !input.trim()} style={{ padding: '12px 20px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #eaa451, #e58c23)', color: '#fff', fontWeight: 600, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}><i className="fa-solid fa-paper-plane"/></button>
          </form>
        </div>
      </div>
    </div>
  );
}
