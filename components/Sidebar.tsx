
import { FC, useState, MouseEvent } from 'react';
import { ChatSession } from '../types';

interface SidebarProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (session: ChatSession) => void;
  onCreateSession: () => void;
  onDeleteSession: (e: MouseEvent, id: string) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: FC<SidebarProps> = ({ 
  sessions, 
  currentSessionId, 
  onSelectSession, 
  onCreateSession, 
  onDeleteSession,
  isOpen,
  toggleSidebar
}) => {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed md:relative inset-y-0 left-0 z-30
          w-[260px] bg-[#0a0a0a] border-r border-white/5 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.25,0.8,0.25,1)]
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {/* Header */}
        <div className="h-14 flex items-center justify-between px-4 border-b border-white/5">
            <span className="font-semibold text-gray-200 tracking-tight text-sm">Library</span>
            <button 
                onClick={onCreateSession}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition"
                title="New Chat"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            </button>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-800">
            {sessions.length === 0 && (
                <div className="text-center text-gray-600 text-xs py-8">No history yet</div>
            )}
            
            {sessions.map(session => (
                <div 
                    key={session.id}
                    onClick={() => {
                        onSelectSession(session);
                        if (window.innerWidth < 768) toggleSidebar();
                    }}
                    className={`
                        group flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-all
                        ${session.id === currentSessionId 
                            ? 'bg-white/10 text-white shadow-sm' 
                            : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}
                    `}
                >
                    <div className="flex flex-col min-w-0 flex-1 pr-2">
                        <span className="truncate text-sm font-medium">{session.title || 'Untitled'}</span>
                        <span className="text-[10px] opacity-60 truncate mt-0.5">
                            {new Date(session.updatedAt).toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                        </span>
                    </div>
                    
                    <button 
                        onClick={(e) => onDeleteSession(e, session.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition"
                        title="Delete Chat"
                    >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                </div>
            ))}
        </div>
        
        {/* User / Footer */}
        <div className="p-4 border-t border-white/5">
             <div className="flex items-center gap-3">
                 <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white shadow-lg">
                    UA
                 </div>
                 <div className="flex flex-col">
                     <span className="text-xs font-medium text-gray-200">Universal AI</span>
                     <span className="text-[10px] text-gray-500">v2.5.0 Pro</span>
                 </div>
             </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
