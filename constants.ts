export const DEFAULT_API_URL = 'https://api.ohmygpt.com/v1/chat/completions';

export const DEFAULT_SYSTEM_PROMPT = `You are an expert Senior Software Engineer and Architect. 
You specialize in writing clean, efficient, and well-documented code.
When providing code, ALWAYS wrap it in markdown code blocks with the language specified.
If the response is long, structure it clearly with headers.`;

export const AVAILABLE_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4 Omni (Best)' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo (Fast)' },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro' },
];

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiUrl: DEFAULT_API_URL,
  model: 'gpt-4o',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
};