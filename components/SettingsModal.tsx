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

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalSettings(settings);
      const isKnown = AVAILABLE_MODELS.some(m => m.id === settings.model);
      setIsCustomModel(!isKnown);
    }
  }, [settings, isOpen]);

  // Handle URL change to auto-load saved key
  const handleUrlChange = (newUrl: string) => {
    const savedKey = localSettings.keyMap?.[newUrl] || '';
    setLocalSettings(prev => ({
      ...prev,
      apiUrl: newUrl,
      apiKey: savedKey
    }));
  };

  const handleKeyChange = (newKey: string) => {
    setLocalSettings(prev => ({
      ...prev,
      apiKey: newKey,
      keyMap: {
        ...prev.keyMap,
        [prev.apiUrl]: newKey
      }
    }));
  };

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const applyPreset = (preset: { url: string, name: string }) => {
      handleUrlChange(preset.url);
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

  const groupedModels = AVAILABLE_MODELS.reduce((acc, model) => {
      if (!acc[model.provider]) acc[model.provider] = [];
      acc[model.provider].push(model);
      return acc;
  }, {} as Record<string, typeof AVAILABLE_MODELS>);

  const isO1Model = localSettings.model.startsWith('o1');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            Configuration
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          
          {/* Presets */}
          <div className="space-y-2">
            <label className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Provider Presets</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(API_PRESETS).map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className={`px-3 py-1.5 text-xs border rounded-md transition ${
                    localSettings.apiUrl === preset.url 
                    ? 'bg-blue-600 border-blue-500 text-white' 
                    : 'bg-gray-800 text-gray-200 border-gray-700 hover:border-gray-500'
                  }`}
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
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://api.openai.com/v1/chat/completions"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-4 pr-10 py-2.5 text-white text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    API Key
                    <span className="ml-2 text-[10px] text-green-400 font-normal bg-green-900/30 px-2 py-0.5 rounded">
                        Autosaved for this URL
                    </span>
                </label>
                <input
                type="password"
                value={localSettings.apiKey}
                onChange={(e) => handleKeyChange(e.target.value)}
                placeholder={localSettings.apiUrl.includes('google') ? 'AIza...' : 'sk-...'}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {isCustomModel && (
                            <input 
                                type="text" 
                                placeholder="Enter specific model ID"
                                className="w-full bg-gray-900 border border-blue-500/50 rounded-lg px-4 py-2 text-white text-sm font-mono"
                                onChange={(e) => setLocalSettings({...localSettings, model: e.target.value})}
                                value={localSettings.model}
                            />
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                        Temperature: <span className="text-blue-400 font-mono">{isO1Model ? '1.0 (Fixed)' : localSettings.temperature}</span>
                    </label>
                    <div className="flex items-center gap-2 h-[42px]">
                        <input 
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            disabled={isO1Model}
                            value={localSettings.temperature}
                            onChange={(e) => setLocalSettings({...localSettings, temperature: parseFloat(e.target.value)})}
                            className={`w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer ${isO1Model ? 'opacity-50 cursor-not-allowed' : ''}`}
                        />
                    </div>
                    {isO1Model && <p className="text-[10px] text-yellow-500 mt-1">o1 models require temperature 1</p>}
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
