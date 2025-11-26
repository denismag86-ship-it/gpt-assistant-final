// Providers Presets
export const API_PRESETS = {
  OPENAI: {
    name: "OpenAI",
    url: "https://api.openai.com/v1/chat/completions"
  },
  GOOGLE: {
    name: "Google Gemini",
    url: "https://generativelanguage.googleapis.com/v1/openai/chat/completions"
  },
  OPENROUTER: {
    name: "OpenRouter",
    url: "https://openrouter.ai/api/v1/chat/completions"
  },
  POLZA: {
    name: "Polza AI",
    url: "https://api.polza.ai/v1/chat/completions"
  },
  GROQ: {
    name: "Groq",
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
If the response is long, structure it clearly with headers.

IMAGE GENERATION INSTRUCTIONS:
If the user asks to generate an image, DO NOT say you cannot. Instead, render a markdown image using the Pollinations API.
Format: ![Image Description](https://image.pollinations.ai/prompt/{description}?width=1024&height=1024&nologo=true)
Replace {description} with a detailed English description of the image, encoding spaces as %20.

Example: ![Cyberpunk City](https://image.pollinations.ai/prompt/cyberpunk%20city%20neon%20lights?width=1024&height=1024&nologo=true)`;

export const AVAILABLE_MODELS = [
  // Google
  { id: 'gemini-3.0-pro', name: 'Gemini 3.0 Pro (New)', provider: 'Google' },
  { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash', provider: 'Google' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'Google' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'Google' },

  // OpenAI Next-Gen
  { id: 'gpt-5', name: 'GPT-5 (Preview)', provider: 'OpenAI' },
  { id: 'o1-preview', name: 'OpenAI o1 (Reasoning)', provider: 'OpenAI' },
  { id: 'o1-mini', name: 'OpenAI o1-mini (Fast)', provider: 'OpenAI' },
  
  // OpenAI Current Gen
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
  
  // Anthropic
  { id: 'claude-4-5-opus-20251126', name: 'Claude 4.5 Opus (Nov 2025)', provider: 'Anthropic' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
  { id: 'claude-3-5-haiku-20241022', name: 'Claude 3.5 Haiku', provider: 'Anthropic' },
  { id: 'claude-3-opus-latest', name: 'Claude 3 Opus', provider: 'Anthropic' },
  
  // Open Source / DeepSeek
  { id: 'deepseek-chat', name: 'DeepSeek V3', provider: 'DeepSeek' },
  { id: 'deepseek-coder', name: 'DeepSeek Coder V2', provider: 'DeepSeek' },
  { id: 'llama-3.2-90b-vision', name: 'Llama 3.2 90B', provider: 'Meta' },
  { id: 'mixtral-8x22b', name: 'Mixtral 8x22B', provider: 'Mistral' },
];

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiUrl: DEFAULT_API_URL,
  model: 'gpt-4o',
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  keyMap: {}, // Initialize empty key map
};
