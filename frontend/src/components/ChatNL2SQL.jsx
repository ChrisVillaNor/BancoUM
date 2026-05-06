import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Mic, Volume2, User } from 'lucide-react';
import './ChatNL2SQL.css';

export default function ChatNL2SQL({ userData }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages, isOpen]);

  // Mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { id: 'welcome', role: 'bot', text: 'Hola. Soy Molleja AI, tu inteligencia artificial financiera. Estoy aquí para ayudarte a consultar tus cuentas y servicios. ¿En qué te puedo ayudar hoy?' }
      ]);
    }
  }, [isOpen, messages.length]);

  const handleMicrophoneClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Tu navegador no soporta reconocimiento de voz. Usa Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText(transcript);
      handleSendMessage(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Error en voz:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const handleSendMessage = async (textToSubmit) => {
    const question = typeof textToSubmit === 'string' ? textToSubmit : inputText;
    if (!question.trim()) return;

    const newMsg = { id: Date.now(), role: 'user', text: question };
    setMessages(prev => [...prev, newMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta: question,
          userId: userData?.id,
          userEmail: userData?.email,
          userRole: userData?.rol || userData?.role || 'client'
        })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error consultando la base de datos");
      }

      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        text: data.respuesta,
        sql: data.sql,
        resultado: data.resultado,
        audioBase64: data.audioBase64
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'bot',
        isError: true,
        text: "Error de conexión: " + error.message
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`chat-widget-btn ${isOpen ? 'open' : 'closed'}`}
      >
        {isOpen ? <X size={28} /> : <Bot size={28} />}
      </button>

      <div className={`chat-widget-container ${isOpen ? '' : 'hidden'}`}>

        <div className="chat-widget-header">
          <div className="chat-header-icon">
            <Bot size={24} color="white" />
          </div>
          <div className="chat-header-info">
            <h3>Molleja AI</h3>
            <p>Inteligencia Artificial Bancaria</p>
          </div>
          <button onClick={() => setIsOpen(false)} className="chat-header-close">
            <X size={18} />
          </button>
        </div>

        <div className="chat-messages">
          {messages.map((m) => (
            <div key={m.id} className={`chat-message-wrapper ${m.role === 'user' ? 'user' : 'bot'}`}>

              {m.role === 'bot' && (
                <div className="chat-avatar bot">
                  <Bot size={14} color="white" />
                </div>
              )}

              <div className={`chat-bubble ${m.role === 'user' ? 'user' : 'bot'} ${m.isError ? 'error' : ''}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'space-between' }}>
                  <div style={{ flex: 1 }}>{m.text}</div>
                  {m.role === 'bot' && (
                    <button 
                      type="button"
                      onClick={() => {
                        if (m.audioBase64) {
                           new Audio(`data:audio/mpeg;base64,${m.audioBase64}`).play();
                        } else {
                           const msg = new SpeechSynthesisUtterance(m.text);
                           msg.lang = 'es-ES';
                           window.speechSynthesis.speak(msg);
                        }
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--brand-gold)', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Escuchar respuesta"
                    >
                      <Volume2 size={18} />
                    </button>
                  )}
                </div>

                {m.role === 'bot' && !m.isError && m.sql && (
                  <div className="chat-sql-block">
                    <div className="chat-sql-code">
                      <span className="chat-sql-label">📄 SQL GENERADO:</span>
                      <pre>{m.sql}</pre>
                    </div>

                    {m.resultado && Array.isArray(m.resultado) && m.resultado.length > 0 && (
                      <div className="chat-sql-results">
                        <div className="chat-sql-results-header">RESULTADOS</div>
                        <div className="chat-sql-results-body">
                          <table className="chat-sql-table">
                            <tbody>
                              {m.resultado.map((row, i) => (
                                <tr key={i}>
                                  {Object.values(row).map((val, idx) => (
                                    <td key={idx}>{String(val)}</td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="chat-avatar user">
                  <User size={14} color="white" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="chat-message-wrapper bot">
              <div className="chat-avatar bot">
                <Bot size={14} color="white" />
              </div>
              <div className="chat-bubble bot chat-typing-indicator">
                <div className="chat-dot"></div>
                <div className="chat-dot"></div>
                <div className="chat-dot"></div>
              </div>
            </div>
          )}
          {messages.length <= 1 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '1rem' }}>
              <button onClick={() => handleSendMessage('¿Cuáles son mis productos activos?')} style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                ¿Cuáles son mis productos?
              </button>
              <button onClick={() => handleSendMessage('¿Cuál es mi información personal?')} style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                Mi información personal
              </button>
              <button onClick={() => handleSendMessage('Quiero hacer un retiro')} style={{ padding: '8px 12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '12px', fontSize: '0.85rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}>
                Quiero hacer un retiro
              </button>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="chat-input-area">
          <form className="chat-input-form" onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}>
            <div className="chat-input-wrapper">
              <input
                type="text"
                className="chat-input"
                placeholder="Escribe tu pregunta o usa el micrófono"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={handleMicrophoneClick}
              className={`chat-icon-btn mic ${isListening ? 'listening' : ''}`}
              title="Dictado de Voz"
            >
              <Mic size={20} />
            </button>

            <button 
              type="submit" 
              disabled={!inputText.trim() || isLoading}
              className="chat-icon-btn send"
            >
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
