export enum Role {
  System = 'system',
  User = 'user',
  Assistant = 'assistant'
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
}

export interface AppSettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  systemPrompt: string;
  temperature: number;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export type StreamChunk = {
  choices: {
    delta: {
      content?: string;
    };
  }[];
};