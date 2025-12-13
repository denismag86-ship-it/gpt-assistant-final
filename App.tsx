
import { useState, useRef, useEffect, useCallback, KeyboardEvent, FC, ChangeEvent, DragEvent, MouseEvent } from 'react';
import { Message, Role, AppSettings, Attachment, ChatSession } from './types';
import { DEFAULT_SETTINGS } from './constants';
import { UniversalLLMService } from './services/ohmygptService';
import { StorageService } from './services/storageService';
import MessageBubble from './components/MessageBubble';
import SettingsModal from './components/SettingsModal';
import Sidebar from './components/Sidebar';

const generateId = () => Math.random().toString(36).substring(2, 15);

const App: FC = () => {
  // --- State ---
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
        const saved = localStorage.getItem('universal-ai-settings'); 
        if (saved) {
            const parsed = JSON.parse(saved);
            return { ...DEFAULT_SETTINGS, ...parsed, keyMap: parsed.keyMap || {} };
        }
        return DEFAULT_SETTINGS;
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    const loadedSessions = StorageService.getSessions();
    setSessions(loadedSessions);
    if (loadedSessions.length > 0) {
        setCurrentSession(loadedSessions[0]);
        setMessages(loadedSessions[0].messages);
    } else {
        createNewSession();
    }
  }, []);

  useEffect(() => {
    if (currentSession) {
        const updatedSession = { 
            ...currentSession, 
            messages: messages,
            updatedAt: Date.now()
        };
        if (!isLoading) {
            StorageService.saveSession(updatedSession);
            setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
        }
    }
  }, [messages, isLoading]);

  useEffect(() => {
    localStorage.setItem('universal-ai-settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Prevent layout shift on input
  useEffect(() => {
    if (inputRef.current) {
        inputRef.current.style.height = 'auto';
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const createNewSession = () => {
    const newSession = StorageService.createSession(settings.model);
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setMessages([]);
    setInput('');
    setAttachments([]);
  };

  const handleSelectSession = (session: ChatSession) => {
    setCurrentSession(session);
    setMessages(session.messages);
    setIsSidebarOpen(false);
  };

  const handleDeleteSession = (e: MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
        StorageService.deleteSession(id);
        const remaining = sessions.filter(s => s.id !== id);
        setSessions(remaining);
        if (currentSession?.id === id) {
            remaining.length > 0 ? handleSelectSession(remaining[0]) : createNewSession();
        }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const processFile = async (file: File) => {
      if (file.size > 5 * 1024 * 1024) {
          alert(`File ${file.name} is too large (max 5MB)`);
          return;
      }
      const isImage = file.type.startsWith('image/');
      const reader = new FileReader();
      reader.onload = (e) => {
          setAttachments(prev => [...prev, {
              name: file.name,
              type: isImage ? 'image' : 'file',
              content: e.target?.result as string,
              mimeType: file.type
          }]);
      };
      isImage ? reader.readAsDataURL(file) : reader.readAsText(file);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) Array.from(e.target.files).forEach(processFile);
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files) Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const removeAttachment = (index: number) => {
      setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSendMessage = useCallback(async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;
    if (!currentSession) return;

    const isLocal = settings.apiUrl.includes('localhost') || settings.apiUrl.includes('127.0.0.1');
    if (!settings.apiKey && !isLocal) {
      setIsSettingsOpen(true);
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: Role.User,
      content: input.trim(),
      attachments: [...attachments],
      timestamp: Date.now()
    };

    let sessionTitle = currentSession.title;
    if (currentSession.messages.length === 0 && userMessage.content) {
        sessionTitle = userMessage.content.slice(0, 30) + (userMessage.content.length > 30 ? '...' : '');
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    const updatedSession = {
        ...currentSession,
        title: sessionTitle,
        messages: updatedMessages,
        updatedAt: Date.now()
    };
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    StorageService.saveSession(updatedSession);

    setInput('');
    setAttachments([]);
    setIsLoading(true);

    const assistantMessageId = generateId();
    let accumulatedContent = '';

    setMessages(prev => [
      ...prev, 
      { id: assistantMessageId, role: Role.Assistant, content: '', timestamp: Date.now() }
    ]);

    await UniversalLLMService.streamChat(
      updatedMessages,
      settings,
      (chunk) => {
        accumulatedContent += chunk;
        setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId ? { ...msg, content: accumulatedContent } : msg
        ));
      },
      () => {
        setIsLoading(false);
        setMessages(prev => {
            const finalSession = { ...updatedSession, messages: prev, updatedAt: Date.now() };
            StorageService.saveSession(finalSession);
            setSessions(old => old.map(s => s.id === finalSession.id ? finalSession : s));
            setCurrentSession(finalSession);
            return prev;
        });
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
        setMessages(prev => prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: `**Connection Error**\n\n${error.message}\n\n*Check your API Key and Model settings.*` }
              : msg
        ));
      }
    );
  }, [input, attachments, isLoading, messages, settings, currentSession]);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-gray-100 overflow-hidden font-sans selection:bg-indigo-500/30">
      
      <Sidebar 
        sessions={sessions}
        currentSessionId={currentSession?.id || null}
        onSelectSession={handleSelectSession}
        onCreateSession={createNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col h-full w-full relative" onDragOver={(e) => e.preventDefault()} onDrop={handleDrop}>
        
        {/* Header - Straight & Glassy */}
        <header className="flex-none h-14 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between px-6 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            
            <div className="flex flex-col">
                <h1 className="font-semibold text-sm tracking-wide text-gray-200">
                    {currentSession?.title || 'New Conversation'}
                </h1>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${settings.apiKey ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-red-500'}`}></span>
                    <span className="text-[10px] uppercase tracking-wider text-gray-500 font-medium">{settings.model}</span>
                </div>
            </div>
          </div>
          
          <button 
              onClick={() => setIsSettingsOpen(true)}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-medium text-gray-300"
            >
              <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>Settings</span>
          </button>
        </header>

        {/* Chat Content - Centered & Clean */}
        <main className="flex-1 overflow-y-auto px-4 scroll-smooth">
          <div className="max-w-3xl mx-auto w-full py-8">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in-up">
                <div className="relative mb-8 group cursor-pointer" onClick={() => setIsSettingsOpen(true)}>
                   <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full group-hover:bg-indigo-500/30 transition-all duration-500"></div>
                   <div className="relative w-20 h-20 bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                   </div>
                </div>
                
                <h2 className="text-2xl font-semibold text-white tracking-tight mb-2">Welcome Back</h2>
                <p className="text-gray-500 mb-8 max-w-sm text-center text-sm leading-relaxed">
                  Start a conversation with Claude 4.5, Gemini 3 Pro, or other cutting-edge models.
                </p>

                <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                    <button onClick={() => { setSettings(s => ({...s, model: 'claude-sonnet-4.5'})); setIsSettingsOpen(true); }} className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition text-sm group">
                        <span className="text-[#d97757] font-serif font-medium">Claude 4.5</span>
                        <span className="text-[10px] text-gray-500 group-hover:text-gray-400">Anthropic</span>
                    </button>
                    <button onClick={() => { setSettings(s => ({...s, model: 'gemini-3-pro'})); setIsSettingsOpen(true); }} className="flex flex-col items-center gap-2 p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition text-sm group">
                        <span className="text-blue-400 font-medium">Gemini 3</span>
                        <span className="text-[10px] text-gray-500 group-hover:text-gray-400">Google</span>
                    </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {messages.map(msg => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                <div ref={messagesEndRef} className="h-4" />
              </div>
            )}
          </div>
        </main>

        {/* Input Area - Floating & Centered */}
        <footer className="flex-none pb-6 px-4 pt-2 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
            <div className="max-w-3xl mx-auto w-full">
              {/* Attachments Preview */}
              {attachments.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto py-2 mb-2 px-1">
                      {attachments.map((att, idx) => (
                          <div key={idx} className="relative group shrink-0">
                              {att.type === 'image' ? (
                                  <img src={att.content} className="h-12 w-12 object-cover rounded-md border border-white/10 shadow-sm" alt="preview" />
                              ) : (
                                  <div className="h-12 w-12 bg-white/5 border border-white/10 rounded-md flex items-center justify-center flex-col p-1">
                                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                  </div>
                              )}
                              <button onClick={() => removeAttachment(idx)} className="absolute -top-1 -right-1 bg-black border border-white/20 text-white rounded-full w-4 h-4 flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition">✕</button>
                          </div>
                      ))}
                  </div>
              )}

              <div className="relative bg-[#111111] border border-white/10 rounded-2xl shadow-2xl ring-1 ring-white/5 focus-within:ring-2 focus-within:ring-blue-500/50 transition-all">
                <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileSelect} />
                
                <textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask anything..."
                    className="w-full bg-transparent border-none text-gray-200 placeholder-gray-600 focus:ring-0 resize-none max-h-[200px] overflow-y-auto py-3.5 pl-4 pr-12 font-sans text-[15px] leading-relaxed"
                    style={{ minHeight: '52px' }}
                />
                
                <div className="absolute bottom-2 right-2 flex items-center gap-1">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 text-gray-500 hover:text-gray-300 hover:bg-white/5 rounded-lg transition"
                        title="Attach files"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                    </button>
                    <button
                        onClick={handleSendMessage}
                        disabled={(!input.trim() && attachments.length === 0) || isLoading}
                        className={`p-2 rounded-lg transition-all duration-200 ${
                        (input.trim() || attachments.length > 0) && !isLoading 
                            ? 'bg-white text-black hover:bg-gray-200' 
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                        }`}
                    >
                        {isLoading ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                        ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                        )}
                    </button>
                </div>
              </div>
              <div className="text-center mt-3 text-[10px] text-gray-600 font-mono tracking-tight">
                AI can make mistakes. Check important info.
              </div>
            </div>
        </footer>

        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onSave={setSettings}
        />
      </div>
    </div>
  );
};

export default App;
