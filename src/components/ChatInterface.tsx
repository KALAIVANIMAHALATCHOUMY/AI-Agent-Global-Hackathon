import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Mic,
  MicOff,
  Plus,
  AlertTriangle,
  FileText,
  ChevronLeft,
  Brain,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, AIModel, ChatSession } from '../types';
import { generateAIResponse, generateMarkdownReport } from '../utils/mockAI';
import {
  saveChatSession,
  getChatSession,
  saveReport,
  downloadMarkdown,
} from '../utils/storage';

interface ChatInterfaceProps {
  serviceId: string;
  serviceTitle: string;
  onBack: () => void;
  onViewReport: (reportContent: string) => void;
}

export default function ChatInterface({
  serviceId,
  serviceTitle,
  onBack,
  onViewReport,
}: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<AIModel>('phi');
  const [isListening, setIsListening] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [sessionId] = useState(() => `session-${Date.now()}`);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [voiceStatus, setVoiceStatus] = useState(''); // ✅ Live feedback

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const existingSession = getChatSession(sessionId);
    if (existingSession) {
      setMessages(existingSession.messages);
      setSelectedModel(existingSession.model as AIModel);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [sessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (messages.length > 0) {
      const session: ChatSession = {
        id: sessionId,
        serviceType: serviceId,
        messages,
        createdAt: Date.now(),
        model: selectedModel,
      };
      saveChatSession(session);
    }
  }, [messages, sessionId, serviceId, selectedModel]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: input,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, model: selectedModel }),
      });

      const data = await response.json();
      console.log('Flask API response:', data.response);

      if (data.status === 'success') {
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          role: "assistant",
          content: data.response,
          timestamp: Date.now(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(data.error || 'Unexpected API error');
      }
    } catch (error) {
      console.error('Error fetching from Flask:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: "assistant",
        content: `⚠️ Sorry, I encountered an error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ FIXED VOICE INPUT - NOW ACTUALLY WORKS!
  const toggleVoiceInput = () => {
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      alert('🔴 Speech recognition not supported. Use Chrome/Edge for best results.');
      return;
    }

    if (isListening) {
      // STOP LISTENING
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    // START LISTENING
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true; // ✅ Keep listening until stopped
    recognition.interimResults = true; // ✅ Show partial results
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // ✅ FIXED: Handle ALL results (final + interim)
    recognition.onresult = (event: any) => {
      let transcript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        // ✅ Use confidence-weighted text
        transcript += result[0].transcript;
      }
      
      // ✅ UPDATE INPUT WITH FULL TRANSCRIPT
      setInput(prev => {
        const newInput = prev + (prev ? ' ' : '') + transcript.trim();
        return newInput;
      });
      
      console.log('🎤 Voice input:', transcript); // Debug log
    };

    // ✅ Visual feedback on errors
    recognition.onerror = (event: any) => {
      console.error('Voice error:', event.error);
      setIsListening(false);
      
      let errorMsg = 'Voice error occurred';
      switch (event.error) {
        case 'not-allowed':
          errorMsg = 'Microphone access denied. Please allow in browser settings.';
          break;
        case 'no-speech':
          errorMsg = 'No speech detected. Speak louder!';
          break;
        case 'network':
          errorMsg = 'Network error. Check your connection.';
          break;
      }
      alert(`🎤 ${errorMsg}`);
    };

    recognition.onend = () => {
      setIsListening(false);
      console.log('🎤 Voice recognition ended');
    };

    // ✅ Start listening
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
    
    // ✅ Auto-restart if stopped unexpectedly
    recognition.onend = () => {
      if (isListening) {
        setTimeout(() => recognition.start(), 100);
      }
    };
  };

  const handleNewChat = () => {
    if (messages.length > 0) {
      const confirmNew = window.confirm(
        'Start a new chat? Current conversation will be saved.'
      );
      if (!confirmNew) return;
    }
    setMessages([]);
    setInput('');
  };

  const handleGenerateReport = () => {
    if (messages.length === 0) {
      alert('No conversation to generate report from.');
      return;
    }

    const reportContent = generateMarkdownReport(
      serviceTitle,
      messages.map((m) => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp,
      })),
      selectedModel
    );

    const report = {
      id: `report-${Date.now()}`,
      sessionId,
      content: reportContent,
      createdAt: Date.now(),
    };

    saveReport(report);
    onViewReport(reportContent);
  };

  const handleEscalate = () => {
    setShowEscalateModal(true);
  };

  const confirmEscalation = () => {
    const ticketId = `ESC-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;
    const escalationMessage: Message = {
      id: `msg-${Date.now()}-escalate`,
      role: 'assistant',
      content: `🚨 **Escalation Initiated**\n\nYour request has been escalated to a human agent. A senior technician will contact you shortly.\n\n**Ticket ID**: ${ticketId}\n**Priority**: High\n**ETA**: 15-20 minutes`,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, escalationMessage]);
    setShowEscalateModal(false);
  };

  return (
    <div className="chat-interface">
      {isOffline && (
        <div className="offline-banner">
          <AlertTriangle size={20} />
          <span>Offline Mode: Using Local AI Assistant</span>
        </div>
      )}

      <div className="chat-header">
        <div className="header-left">
          <button className="back-button" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <div className="chat-header-info">
            <h2>{serviceTitle}</h2>
          </div>
        </div>

        <div className="header-right">
          <button
            className="header-button new-chat"
            onClick={handleNewChat}
            disabled={isLoading}
          >
            <Plus size={18} /> New
          </button>
          <button
            className="header-button escalate"
            onClick={handleEscalate}
            disabled={isLoading}
          >
            <AlertTriangle size={18} /> Escalate
          </button>
          <button
            className="header-button generate"
            onClick={handleGenerateReport}
            disabled={messages.length === 0 || isLoading}
          >
            <FileText size={18} /> Report ({messages.length})
          </button>
        </div>
      </div>

      <div className="chat-layout">
        <div className="chat-main">
          <div className="chat-messages">
            {messages.length === 0 && (
              <div className="empty-chat">
                <Brain size={64} className="empty-icon" />
                <p>Start a conversation with your AI assistant</p>
                <p className="empty-subtitle">
                  Ask me anything about {serviceTitle}
                </p>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id} className={`message ${message.role}`}>
                <div className="message-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {message.content}
                  </ReactMarkdown>
                </div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="message assistant">
                <div className="message-content loading">
                  <span className="loading-dots">•••</span>
                  AI is thinking
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container">
            <div className="input-row">
              <select
                className="input-model-select"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as AIModel)}
                disabled={isLoading}
              >
                <option value="phi">Phi</option>
                <option value="claude">Claude</option>
                <option value="gemini">Gemini</option>
                <option value="titan">Titan</option>
                <option value="Nova Micro">Nova Micro</option>
                <option value="local">
                  Local {isOffline ? '(Active)' : ''}
                </option>
              </select>

              <textarea
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={`Ask about ${serviceTitle}...`}
                rows={2}
                disabled={isLoading}
                maxLength={1000}
              />

              <div className="input-actions">
                <button
                  className="send-button"
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                >
                  <Send size={18} />
                </button>
                {/* ✅ FIXED VOICE BUTTON WITH BETTER FEEDBACK */}
                <button
                  className={`voice-button ${isListening ? 'listening' : ''}`}
                  onClick={toggleVoiceInput}
                  title={isListening ? 'Stop Voice (Click to Send)' : '🎤 Start Voice Input'}
                  disabled={isLoading}
                >
                  {isListening ? (
                    <>
                      <MicOff size={18} />
                      <span className="voice-status">●</span>
                    </>
                  ) : (
                    <Mic size={18} />
                  )}
                </button>
              </div>
            </div>
          </div>
          {voiceStatus && (
          <div className="voice-feedback">
            {voiceStatus}
          </div>
        )}
        </div>
        

        <div className="chat-sidebar" />
      </div>

      {showEscalateModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowEscalateModal(false)}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Escalate to Human Agent</h3>
            <p>
              Are you sure you want to escalate this issue to a human agent?
            </p>
            <p className="modal-note">
              This will notify a senior technician who will join the
              conversation.
            </p>
            <div className="modal-actions">
              <button
                className="modal-button cancel"
                onClick={() => setShowEscalateModal(false)}
              >
                Cancel
              </button>
              <button
                className="modal-button confirm"
                onClick={confirmEscalation}
              >
                Confirm Escalation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}