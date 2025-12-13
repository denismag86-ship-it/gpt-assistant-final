
import { ChatSession, Message } from '../types';

const STORAGE_KEY = 'universal_ai_sessions';

export const StorageService = {
  getSessions: (): ChatSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const sessions = JSON.parse(stored);
      // Sort by updatedAt desc
      return sessions.sort((a: ChatSession, b: ChatSession) => b.updatedAt - a.updatedAt);
    } catch (e) {
      console.error("Failed to load sessions", e);
      return [];
    }
  },

  saveSession: (session: ChatSession) => {
    const sessions = StorageService.getSessions();
    const index = sessions.findIndex(s => s.id === session.id);
    
    if (index >= 0) {
      sessions[index] = session;
    } else {
      sessions.unshift(session);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  deleteSession: (id: string) => {
    const sessions = StorageService.getSessions().filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  },

  createSession: (initialModel?: string): ChatSession => {
    return {
      id: Math.random().toString(36).substring(2, 15),
      title: 'New Project',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      modelUsed: initialModel
    };
  }
};
