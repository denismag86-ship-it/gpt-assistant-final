import React, { useState, useEffect } from 'react';
import { AppSettings } from '../types';
import { AVAILABLE_MODELS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSave: (newSettings: AppSettings) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-lg p-6 transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">API URL (Base URL)</label>
            <input
              type="text"
              value={localSettings.apiUrl}
              onChange={(e) => setLocalSettings({ ...localSettings, apiUrl: e.target.value })}
              placeholder="https://api.ohmygpt.com/v1/chat/completions"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="text-[10px] text-gray-500 mt-1">Change this if you need to use a mirror or a different provider.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
            <input
              type="password"
              value={localSettings.apiKey}
              onChange={(e) => setLocalSettings({ ...localSettings, apiKey: e.target.value })}
              placeholder="sk-..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">Get your key from <a href="https://www.ohmygpt.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ohmygpt.com</a></p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Model</label>
            <div className="flex gap-2">
                <select
                value={localSettings.model}
                onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                >
                {AVAILABLE_MODELS.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                ))}
                </select>
                {/* Allow custom model entry */}
                <input 
                    type="text" 
                    placeholder="Custom ID"
                    className="w-1/3 bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-white text-xs"
                    onChange={(e) => setLocalSettings({...localSettings, model: e.target.value})}
                    value={!AVAILABLE_MODELS.find(m => m.id === localSettings.model) ? localSettings.model : ''}
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">System Prompt</label>
            <textarea
              value={localSettings.systemPrompt}
              onChange={(e) => setLocalSettings({ ...localSettings, systemPrompt: e.target.value })}
              rows={4}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none font-mono"
            />
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-300 mb-1">Temperature ({localSettings.temperature})</label>
             <input 
               type="range" 
               min="0" 
               max="2" 
               step="0.1"
               value={localSettings.temperature}
               onChange={(e) => setLocalSettings({...localSettings, temperature: parseFloat(e.target.value)})}
               className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
             />
          </div>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-800 transition">
            Cancel
          </button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition shadow-lg shadow-blue-500/20">
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;