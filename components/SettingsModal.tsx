import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { AVAILABLE_MODELS, API_PRESETS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [isCustomModel, setIsCustomModel] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    // Check if the current model is in our known list. If not, it's a custom model.
    const isKnown = AVAILABLE_MODELS.some(m => m.id === settings.model);
    setIsCustomModel(!isKnown);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const applyPreset = (preset: { url: string, name: string }) => {
      setLocalSettings(prev => ({ ...prev, apiUrl: preset.url }));
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      if (val === 'custom_input_option') {
          setIsCustomModel(true);
          setLocalSettings(prev => ({ ...prev, model: '' }));
      } else {
          setIsCustomModel(false);
          setLocalSettings(prev => ({ ...prev, model: val }));
      }
  };

  // Group models by provider for the dropdown
  const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = [];
      acc[model.provider].push(model);
      return acc;
  }, {} as Record<string, typeof AVAILABLE_MODELS>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            API Configuration
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Quick Connect Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(API_PRESETS).map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-xs text-gray-200 border border-gray-700 hover:border-blue-500 rounded-md transition"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4 border-t border-gray-800 pt-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Base URL</label>
                <div className="relative">
                    <input
                    type="text"
                    value={localSettings.apiUrl}
                    onChange={(e) => setLocalSettings({ ...localSettings, apiUrl: e.target.value })}
                    placeholder="https://api.openai.com/v1/chat/completions"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-10 py-2.5 text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                    <div className="absolute right-3 top-2.5 text-gray-500 pointer-events-none">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" /></svg>
                    </div>
                </div>
                <p className="text-[10px] text-gray-500 mt-1">Must be an OpenAI-compatible endpoint. Usually ends in <code className="bg-gray-800 px-1 rounded">/v1/chat/completions</code></p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                <input
                type="password"
                value={localSettings.apiKey}
                onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
                <p className="text-[10px] text-gray-500 mt-1">Stored locally. Leave empty for local models.</p>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">AI Model</label>
                <div className="flex flex-col gap-2">
                    <select
                        value={isCustomModel ? 'custom_input_option' : localSettings.model}
                        onChange={handleModelChange}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        {Object.entries(groupedModels).map(([provider, models]) => (
                            <optgroup key={provider} label={provider}>
                                {models.map(m => (
                                    <option key={m.id} value={m.id}>{m.name}</option>
                                ))}
                            </optgroup>
                        ))}
                        <option value="custom_input_option">+ Custom Model ID</option>
                    </select>

                    {/* Custom Model Input - Visible if 'Custom' is selected or model is unknown */}
                    {isCustomModel && (
                        <div className="animate-fade-in mt-1">
                             <input 
                                type="text" 
                                placeholder="Enter specific model ID (e.g. gpt-5-turbo)"
                                className="w-full bg-gray-900 border border-blue-500/50 rounded-lg px-4 py-2.5 text-white text-sm font-mono placeholder-gray-600 focus:ring-1 focus:ring-blue-500 outline-none"
                                onChange={(e) => setLocalSettings({...localSettings, model: e.target.value})}
                                value={localSettings.model}
                                autoFocus
                            />
                            <p className="text-[10px] text-blue-400/80 mt-1.5 ml-1">
                                Enter the exact Model ID from your provider's documentation (e.g. <code>anthropic/claude-3-opus</code> for OpenRouter).
                            </p>
                        </div>
                    )}
                </div>
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">System Instructions</label>
                <textarea
                value={localSettings.systemPrompt}
                onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="You are a helpful assistant..."
                />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-end gap-3 bg-gray-900/50 rounded-b-xl">
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition text-sm">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-blue-500/20">
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
