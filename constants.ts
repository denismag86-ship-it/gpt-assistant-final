
// Providers Presets
export const API_PRESETS = {
  POLZA: {
    name: "Polza AI (Theia)",
    url: "https://theia.ru.tuna.am/v1/chat/completions"
  },
  ANTHROPIC: {
    name: "Anthropic API",
    url: "https://api.anthropic.com/v1/messages" // Note: Client handles OpenAI adapter usually, but we assume OpenAI compat proxy for this demo or direct support
  },
  GROQ: {
    name: "Groq (Fast)",
    url: "https://api.groq.com/openai/v1/chat/completions"
  },
  GOOGLE: {
    name: "Google Gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions"
  },
  OPENAI: {
    name: "OpenAI",
    url: "https://api.openai.com/v1/chat/completions"
  },
  DEEPSEEK: {
    name: "DeepSeek",
    url: "https://api.deepseek.com/chat/completions"
  },
  XAI: {
    name: "xAI (Grok)",
    url: "https://api.x.ai/v1/chat/completions"
  },
  MISTRAL: {
    name: "Mistral AI",
    url: "https://api.mistral.ai/v1/chat/completions"
  },
  OLLAMA: {
    name: "Ollama (Local)",
    url: "http://localhost:11434/v1/chat/completions"
  }
};

export const DEFAULT_API_URL = API_PRESETS.GROQ.url;

export const DEFAULT_SYSTEM_PROMPT = `You are an expert Senior Software Engineer and Architect. 
You specialize in writing clean, efficient, and well-documented code.
When providing code, ALWAYS wrap it in markdown code blocks with the language specified.
If the response is long, structure it clearly with headers.

FILE & IMAGE HANDLING:
- If the user attaches code files, analyze them carefully.
- If the user attaches images, use your vision capabilities to describe or analyze them.

IMAGE GENERATION INSTRUCTIONS:
If the user asks to generate an image, DO NOT say you cannot. Instead, render a markdown image using the Pollinations API.
Format: ![Image Description](https://image.pollinations.ai/prompt/{description}?width=1024&height=1024&nologo=true)
Replace {description} with a detailed English description of the image, encoding spaces as %20.`;

export const AVAILABLE_MODELS = [
  // --- ANTHROPIC (Special Section) ---
  { id: 'claude-opus-4.5', name: 'Claude Opus 4.5', provider: 'Anthropic', description: 'Top-tier reasoning & coding agent' },
  { id: 'claude-sonnet-4.5', name: 'Claude Sonnet 4.5', provider: 'Anthropic', description: 'Balanced high-intelligence' },
  { id: 'claude-haiku-4.5', name: 'Claude Haiku 4.5', provider: 'Anthropic', description: 'Ultra-fast & cost effective' },
  { id: 'claude-3-5-sonnet-20241022', name: 'Claude 3.5 Sonnet (Legacy)', provider: 'Anthropic', description: 'Previous stable version' },

  // --- GOOGLE GEMINI ---
  { id: 'gemini-3-pro', name: 'Gemini 3 Pro', provider: 'Google', description: 'Most intelligent, multimodal & agentic' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (Thinking)', provider: 'Google', description: 'Advanced reasoning model' },
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google', description: 'High speed, 1M+ context' },

  // --- XAI (Grok) ---
  { id: 'grok-4.1', name: 'Grok 4.1', provider: 'xAI', description: 'Latest flagship from xAI' },
  { id: 'grok-4.1-fast', name: 'Grok 4.1 Fast', provider: 'xAI', description: 'Low latency reasoning' },

  // --- MISTRAL ---
  { id: 'mistral-large-3', name: 'Mistral Large 3', provider: 'Mistral', description: 'Top open-weight class' },
  { id: 'ministral-3', name: 'Ministral 3', provider: 'Mistral', description: 'Efficient edge model' },

  // --- DEEPSEEK ---
  { id: 'deepseek-v3.2', name: 'DeepSeek V3.2', provider: 'DeepSeek', description: 'MoE Architecture, reasoning focus' },

  // --- QWEN (Alibaba) ---
  { id: 'qwen-3-max', name: 'Qwen 3 Max', provider: 'Alibaba', description: 'Trillion-parameter class' },
  { id: 'qwen-3-omni', name: 'Qwen 3 Omni', provider: 'Alibaba', description: 'Full multimodal support' },

  // --- GROQ (Optimized Llama) ---
  { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B', provider: 'Groq', description: 'Open source standard' },
  { id: 'mixtral-8x7b-32768', name: 'Mixtral 8x7B', provider: 'Groq', description: 'Fast MoE' },
  
  // --- OPENAI ---
  { id: 'gpt-5.2', name: 'GPT-5.2 Thinking', provider: 'OpenAI', description: 'Next-gen reasoning' },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'OpenAI', description: 'Current flagship' },
  { id: 'o1', name: 'OpenAI o1', provider: 'OpenAI', description: 'Reasoning model' },
];

export const DEFAULT_SETTINGS = {
  apiKey: '',
  apiUrl: DEFAULT_API_URL,
  model: 'claude-sonnet-4.5', // Defaulting to the requested high-tier model
  systemPrompt: DEFAULT_SYSTEM_PROMPT,
  temperature: 0.7,
  keyMap: {}, 
};
