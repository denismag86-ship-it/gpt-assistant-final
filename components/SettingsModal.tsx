
import { useState, useEffect, FC, ChangeEvent } from 'react';
import { AppSettings } from '../types';
import { AVAILABLE_MODELS, API_PRESETS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

type Tab = 'general' | 'anthropic' | 'models' | 'system';

const SettingsModal: FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const [isCustomModel, setIsCustomModel] = useState(false);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      const isKnown = AVAILABLE_MODELS.some(m => m.id === settings.model);
      setIsCustomModel(!isKnown);
      
      // Auto-switch to Anthropic tab if an Anthropic model is selected
      if (settings.model.includes('claude')) {
          setActiveTab('anthropic');
      }
    }
  }, [settings, isOpen]);

  const handleUrlChange = (newUrl: string) => {
    const savedKey = localSettings.keyMap?.[newUrl] || '';
    setLocalSettings(prev => ({ ...prev, apiUrl: newUrl, apiKey: savedKey }));
  };

  const handleKeyChange = (newKey: string) => {
    setLocalSettings(prev => ({
      ...prev,
      apiKey: newKey,
      keyMap: { ...prev.keyMap, [prev.apiUrl]: newKey }
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handlePresetSelect = (preset: { url: string, name: string }) => {
      handleUrlChange(preset.url);
  };

  const anthropicModels = AVAILABLE_MODELS.filter(m => m.provider === 'Anthropic');
  const otherModels = AVAILABLE_MODELS.filter(m => m.provider !== 'Anthropic');

  const groupedModels = otherModels.reduce((acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = [];
      acc[model.provider].push(model);
      return acc;
  }, {} as Record<string, typeof AVAILABLE_MODELS>);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-[#111111] border border-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex overflow-hidden ring-1 ring-white/10">
        
        {/* Sidebar Tabs */}
        <aside className="w-64 bg-[#0a0a0a] border-r border-gray-800 flex flex-col">
          <div className="p-6">
             <h2 className="text-lg font-bold text-white tracking-tight">Settings</h2>
             <p className="text-xs text-gray-500 mt-1">Configure your AI client</p>
          </div>
          
          <nav className="flex-1 px-3 space-y-1">
            <button 
                onClick={() => setActiveTab('general')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'general' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                General & API
            </button>
            <button 
                onClick={() => setActiveTab('anthropic')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'anthropic' ? 'bg-[#d97757]/10 text-[#d97757]' : 'text-gray-400 hover:text-[#d97757] hover:bg-[#d97757]/5'}`}
            >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.86 10.024C17.369 6.634 14.448 4 10.889 4C6.558 4 3.033 7.425 2.894 11.72C1.22 12.56 0 14.24 0 16.2C0 19.403 2.597 22 5.8 22H17.5V19ZM11 8.5C12.933 8.5 14.5 10.067 14.5 12C14.5 13.933 12.933 15.5 11 15.5C9.067 15.5 7.5 13.933 7.5 12C7.5 10.067 9.067 8.5 11 8.5Z"/></svg>
                Anthropic Suite
            </button>
            <button 
                onClick={() => setActiveTab('models')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'models' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                Other Providers
            </button>
            <button 
                onClick={() => setActiveTab('system')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'system' ? 'bg-gray-800 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'}`}
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                System Prompt
            </button>
          </nav>

          <div className="p-4 border-t border-gray-800">
             <button onClick={handleSave} className="w-full py-2 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition">
                 Save Changes
             </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-[#111111] flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-thin scrollbar-thumb-gray-800">
            
            {/* --- GENERAL TAB --- */}
            {activeTab === 'general' && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Connection Settings</h3>
                    
                    <div className="grid grid-cols-2 gap-2 mb-6">
                        {Object.values(API_PRESETS).filter(p => p.name !== 'Anthropic API').slice(0, 6).map((preset) => (
                            <button
                            key={preset.name}
                            onClick={() => handlePresetSelect(preset)}
                            className={`p-3 text-left border rounded-xl transition-all ${
                                localSettings.apiUrl === preset.url 
                                ? 'bg-blue-600/10 border-blue-500 text-blue-400' 
                                : 'bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-600'
                            }`}
                            >
                                <div className="font-semibold text-xs uppercase tracking-wide opacity-70">Provider</div>
                                <div className="text-sm font-medium truncate">{preset.name}</div>
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-sm font-medium text-gray-400 mb-2">API Endpoint URL</label>
                            <input
                                type="text"
                                value={localSettings.apiUrl}
                                onChange={(e) => handleUrlChange(e.target.value)}
                                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                            />
                        </div>

                        <div className="group">
                            <label className="block text-sm font-medium text-gray-400 mb-2">
                                API Key <span className="text-gray-600 ml-2 font-normal">(Stored locally)</span>
                            </label>
                            <input
                                type="password"
                                value={localSettings.apiKey}
                                onChange={(e) => handleKeyChange(e.target.value)}
                                placeholder="sk-..."
                                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 text-white text-sm focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* --- ANTHROPIC TAB --- */}
            {activeTab === 'anthropic' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="text-2xl font-serif text-[#d97757]">Anthropic Intelligence</h3>
                            <p className="text-gray-500 text-sm mt-1">Select a Claude model optimized for your task.</p>
                        </div>
                        <div className="w-10 h-10 bg-[#d97757]/20 rounded-xl flex items-center justify-center text-[#d97757]">
                             <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 19C19.9853 19 22 16.9853 22 14.5C22 12.132 20.177 10.244 17.86 10.024C17.369 6.634 14.448 4 10.889 4C6.558 4 3.033 7.425 2.894 11.72C1.22 12.56 0 14.24 0 16.2C0 19.403 2.597 22 5.8 22H17.5V19ZM11 8.5C12.933 8.5 14.5 10.067 14.5 12C14.5 13.933 12.933 15.5 11 15.5C9.067 15.5 7.5 13.933 7.5 12C7.5 10.067 9.067 8.5 11 8.5Z"/></svg>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {anthropicModels.map(model => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    setLocalSettings(prev => ({...prev, model: model.id}));
                                }}
                                className={`relative group flex items-start gap-4 p-4 rounded-xl border transition-all ${
                                    localSettings.model === model.id 
                                    ? 'bg-[#d97757]/10 border-[#d97757] ring-1 ring-[#d97757]' 
                                    : 'bg-[#1a1a1a] border-gray-800 hover:border-gray-600'
                                }`}
                            >
                                <div className={`w-4 h-4 mt-1 rounded-full border flex items-center justify-center ${
                                    localSettings.model === model.id ? 'border-[#d97757]' : 'border-gray-600'
                                }`}>
                                    {localSettings.model === model.id && <div className="w-2 h-2 bg-[#d97757] rounded-full" />}
                                </div>
                                <div className="text-left">
                                    <h4 className={`font-semibold ${localSettings.model === model.id ? 'text-[#d97757]' : 'text-gray-200'}`}>
                                        {model.name}
                                    </h4>
                                    <p className="text-sm text-gray-500 mt-1">{model.description}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="mt-8 p-4 bg-[#1a1a1a] rounded-xl border border-gray-800">
                        <label className="block text-sm font-medium text-gray-400 mb-2">Thinking Temperature</label>
                        <input 
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={localSettings.temperature}
                            onChange={(e) => setLocalSettings({...localSettings, temperature: parseFloat(e.target.value)})}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-[#d97757]"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>Precise (0.0)</span>
                            <span>{localSettings.temperature}</span>
                            <span>Creative (1.0)</span>
                        </div>
                    </div>
                </div>
            )}

            {/* --- ALL MODELS TAB --- */}
            {activeTab === 'models' && (
                <div className="space-y-6 animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">Universal Models</h3>
                    
                    <div className="space-y-6">
                        {Object.entries(groupedModels).map(([provider, models]) => (
                            <div key={provider}>
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 border-b border-gray-800 pb-2">{provider}</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {models.map(model => (
                                        <button
                                            key={model.id}
                                            onClick={() => setLocalSettings(prev => ({...prev, model: model.id}))}
                                            className={`p-3 text-left rounded-lg border transition-all ${
                                                localSettings.model === model.id
                                                ? 'bg-gray-800 border-white text-white'
                                                : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                                            }`}
                                        >
                                            <div className="font-medium">{model.name}</div>
                                            <div className="text-[10px] text-gray-500 mt-0.5 truncate">{model.description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-t border-gray-800">
                        <label className="flex items-center gap-2 cursor-pointer text-gray-400 hover:text-white mb-2">
                             <input type="checkbox" checked={isCustomModel} onChange={() => setIsCustomModel(!isCustomModel)} className="rounded bg-gray-800 border-gray-600"/>
                             <span className="text-sm">Use Custom Model ID</span>
                        </label>
                        {isCustomModel && (
                             <input 
                                type="text" 
                                placeholder="Enter specific model ID (e.g. llama-3.2-11b)"
                                className="w-full bg-[#1a1a1a] border border-blue-500/50 rounded-lg px-4 py-2 text-white text-sm font-mono"
                                onChange={(e) => setLocalSettings({...localSettings, model: e.target.value})}
                                value={localSettings.model}
                            />
                        )}
                    </div>
                </div>
            )}

            {/* --- SYSTEM PROMPT TAB --- */}
            {activeTab === 'system' && (
                <div className="h-full flex flex-col animate-fade-in">
                    <h3 className="text-xl font-bold text-white mb-4">System Instructions</h3>
                    <p className="text-sm text-gray-400 mb-4">Define how the AI should behave, format code, and handle specific tasks.</p>
                    <textarea
                        value={localSettings.systemPrompt}
                        onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
                        className="flex-1 w-full bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 text-gray-300 font-mono text-sm leading-relaxed focus:ring-2 focus:ring-gray-700 outline-none resize-none"
                        placeholder="You are a helpful assistant..."
                    />
                </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsModal;
