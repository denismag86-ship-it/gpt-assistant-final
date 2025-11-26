import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Message, Role, AppSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';
// We import from the same file but the class inside is now UniversalLLMService
import { UniversalLLMService } from './services/ohmygptService';
import MessageBubble from './components/MessageBubble.tsx';
import SettingsModal from './components/SettingsModal.tsx';

const generateId = () => Math.random().toString(36).substring(2, 15);

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('universal-ai-settings'); // Changed storage key
    if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_SETTINGS, ...parsed };
    }
    // Fallback for migration from old app version
    const oldSaved = localStorage.getItem('ohmygpt-settings');
    if (oldSaved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(oldSaved) };
    }
    return DEFAULT_SETTINGS;
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    localStorage.setItem('universal-ai-settings', JSON.stringify(settings));
  }, [settings]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  }, [input]);


  const handleSendMessage = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    // We allow missing API key if it's localhost (e.g. Ollama)
    const isLocal = settings.apiUrl.includes('localhost');
    if (!settings.apiKey && !isLocal) {
      setIsSettingsOpen(true);
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: Role.User,
      content: input.trim(),
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    if (inputRef.current) inputRef.current.style.height = 'auto';

    const assistantMessageId = generateId();
    let accumulatedContent = '';

    setMessages(prev => [
      ...prev, 
      {
        id: assistantMessageId,
        role: Role.Assistant,
        content: '',
        timestamp: Date.now()
      }
    ]);

    await UniversalLLMService.streamChat(
      [...messages, userMessage],
      settings,
      (chunk) => {
        accumulatedContent += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMessageId 
            ? { ...msg, content: accumulatedContent }
            : msg
        ));
      },
      () => {
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
        setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: `**Connection Error**\n\n${error.message}\n\n*Check your settings.*` }
              : msg
        ));
      }
    );
  }, [input, isLoading, messages, settings]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear chat history?')) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex-none h-16 border-b border-gray-800 bg-gray-900/50 backdrop-blur-md flex items-center justify-between px-6 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">Universal AI</h1>
            <p className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${settings.apiKey || settings.apiUrl.includes('localhost') ? 'bg-green-500' : 'bg-red-500'}`}></span>
                {settings.model}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={handleClearChat}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
            title="Clear Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          <button 
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition"
            title="Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </button>
        </div>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-4xl mx-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center text-gray-500 animate-fade-in-up">
              <div className="w-20 h-20 bg-gray-900 border border-gray-800 rounded-3xl flex items-center justify-center mb-6 shadow-2xl">
                 <svg className="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-200 mb-3">Connect your Model</h2>
              <p className="max-w-md text-gray-400 mb-8 leading-relaxed">
                Connect to OpenAI, Groq, DeepSeek, or run local models with Ollama. 
                Configure your provider settings to get started.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-sm">
                  <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition text-sm">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span> OpenAI / Groq
                  </button>
                  <button onClick={() => setIsSettingsOpen(true)} className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl transition text-sm">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span> Ollama (Local)
                  </button>
              </div>
            </div>
          ) : (
            <>
              {messages.map(msg => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </main>

      {/* Input Area */}
      <footer className="flex-none bg-gray-900/90 backdrop-blur border-t border-gray-800 p-4">
        <div className="max-w-4xl mx-auto relative">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="w-full bg-gray-800/50 border border-gray-700 hover:border-gray-600 text-white placeholder-gray-500 rounded-xl py-3.5 pl-4 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 resize-none max-h-48 overflow-y-auto shadow-xl transition-all"
            style={{ minHeight: '52px' }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 bottom-3 p-2 rounded-lg transition-all duration-200 ${
              input.trim() && !isLoading 
                ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 scale-100' 
                : 'bg-transparent text-gray-600 cursor-not-allowed scale-95'
            }`}
          >
            {isLoading ? (
               <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            )}
          </button>
        </div>
        <div className="text-center mt-3">
            <span className="text-[10px] text-gray-600 font-mono">Universal API Client • Markdown Support</span>
        </div>
      </footer>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={setSettings}
      />
    </div>
  );
};

export default App;
