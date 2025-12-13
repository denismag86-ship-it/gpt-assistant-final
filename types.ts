
export enum Role {
  System = 'system',
  User = 'user',
  Assistant = 'assistant'
}

export interface Attachment {
  name: string;
  type: 'image' | 'file';
  content: string; // Base64 for images, text content for files
  mimeType?: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  attachments?: Attachment[];
  timestamp: number;
}

export interface AppSettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  systemPrompt: string;
  temperature: number;
  // Dictionary to store keys per provider URL: { "https://api.openai.com...": "sk-..." }
  keyMap: Record<string, string>;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  modelUsed?: string;
}

export type StreamChunk = {
  choices: {
    delta: {
      content?: string;
    };
  }[];
};
