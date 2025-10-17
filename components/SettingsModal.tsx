import React, { useState } from 'react';
import { useSettings } from '../SettingsContext';
import { CloseIcon } from './icons/CloseIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, memory, updateSettings, addMemoryItem, removeMemoryItem, clearAllData } = useSettings();
  const [newMemory, setNewMemory] = useState('');

  if (!isOpen) return null;

  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    addMemoryItem(newMemory);
    setNewMemory('');
  };

  const handleClearAndReset = () => {
    clearAllData();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold">AI Personalization & Settings</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </header>

        <main className="p-6 overflow-y-auto space-y-6">
          {/* AI Memory Section */}
          <section>
            <h3 className="text-lg font-semibold text-cyan-400 mb-2">Personalized Memory</h3>
            <p className="text-sm text-gray-400 mb-4">
              Help the AI remember key facts about you, your projects, or your preferences. This information is stored locally in your browser.
            </p>
            <form onSubmit={handleAddMemory} className="flex gap-2 mb-4">
              <input
                type="text"
                value={newMemory}
                onChange={e => setNewMemory(e.target.value)}
                placeholder="e.g., I am a frontend developer"
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 text-sm"
              />
              <button type="submit" className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-500 transition-colors disabled:bg-gray-600" disabled={!newMemory.trim()}>
                Add
              </button>
            </form>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {memory.length === 0 && <p className="text-sm text-gray-500">No memories stored yet.</p>}
              {memory.map(item => (
                <div key={item.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md text-sm">
                  <span className="text-gray-300 flex-1 break-words pr-2">{item.content}</span>
                  <button onClick={() => removeMemoryItem(item.id)} className="text-gray-500 hover:text-red-400 flex-shrink-0">
                    <CloseIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* AI Behavior Section */}
          <section>
            <h3 className="text-lg font-semibold text-cyan-400 mb-4">Adaptive Settings</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="tone-select" className="block text-sm font-medium text-gray-300 mb-1">Communication Tone</label>
                <select
                  id="tone-select"
                  value={settings.tone}
                  onChange={e => updateSettings({ tone: e.target.value as 'professional' | 'casual' | 'creative' })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="creative">Creative</option>
                </select>
              </div>
              <div>
                <label htmlFor="length-select" className="block text-sm font-medium text-gray-300 mb-1">Response Length</label>
                <select
                  id="length-select"
                  value={settings.length}
                  onChange={e => updateSettings({ length: e.target.value as 'concise' | 'detailed' })}
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="detailed">Detailed</option>
                  <option value="concise">Concise</option>
                </select>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="flex justify-between items-center p-4 border-t border-gray-700">
            <button onClick={handleClearAndReset} className="bg-red-700 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm">
                Clear & Reset
            </button>
            <button onClick={onClose} className="bg-gray-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-gray-500 transition-colors">
                Close
            </button>
        </footer>
      </div>
    </div>
  );
};

export default SettingsModal;