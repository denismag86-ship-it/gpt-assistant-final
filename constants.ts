// Providers Presets
export const API_PRESETS = {
  OPENAI: {
    name: "OpenAI (Official)",
    url: "https://api.openai.com/v1/chat/completions"
  },
  OHMYGPT: {
    name: "OhMyGPT",
    url: "https://api.ohmygpt.com/v1/chat/completions"
  },
  GROQ: {
    name: "Groq (Fastest)",
    url: "https://api.groq.com/openai/v1/chat/completions"
  },
  DEEPSEEK: {
    name: "DeepSeek",
    url: "https://api.deepseek.com/chat/completions"
  },
  OLLAMA: {
    name: "Ollama (Local)",
    url: "http://localhost:11434/v1/chat/completions"
  }
};

export const DEFAULT_API_URL = API_PRESETS.OPENAI.url;

export const DEFAULT_SYSTEM_PROMPT = `You are an expert Senior Software Engineer and Architect. 
You specialize in writing clean, efficient, and well-documented code.
When providing code, ALWAYS wrap it in markdown code blocks with the language specified.
If the response is long, structure it clearly with headers.`;

export const AVAILABLE_MODELS = [
  // OpenAI & Compatible
  { id: 'gpt-4o', name: 'GPT-4 Omni' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
  
  // Anthropic (via proxies mostly)
  { id: 'claude-3-5-sonnet-20240620', name: 'Claude 3.5 Sonnet' },
  { id: 'claude-3-opus-20240229', name: 'Claude 3 Opus' },
  
  // Open Source / Other Providers
  { id: 'llama3-70b-8192', name: 'Llama 3 70B (Groq)' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B (Groq)' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder' },
  { id: 'deepseek-chat', name: 'DeepSeek Chat' },
  
  // Local (Ollama defaults)
  { id: 'llama3', name: 'Llama 3 (Local)' },
  { id: 'mistral', name: 'Mistral (Local)' },
];

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiUrl: DEFAULT_API_URL,
  model: 'gpt-4o',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
};
