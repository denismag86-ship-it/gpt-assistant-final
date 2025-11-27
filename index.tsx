export type Role = 'user' | 'assistant' | 'system';

export interface Message {
  role: Role;
  content: string;
}

export interface AppSettings {
  apiKey: string;
  apiUrl: string;
  model: string;
  temperature: number;
  systemPrompt?: string;
  keyMap?: Record<string, string>;
}

export interface StreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

export interface ApiPreset {
  name: string;
  url: string;
  docs?: string;
}

export interface ModelInfo {
  id: string;
  name: string;
  provider: string;
  tier: 'flagship' | 'advanced' | 'standard' | 'mini' | 'reasoning' | 'coding' | 'vision';
}
