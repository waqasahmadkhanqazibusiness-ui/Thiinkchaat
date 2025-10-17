import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

export interface MemoryItem {
  id: string;
  content: string;
}

export interface Settings {
  tone: 'professional' | 'casual' | 'creative';
  length: 'concise' | 'detailed';
}

interface SettingsContextType {
  settings: Settings;
  memory: MemoryItem[];
  profession: string | null;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addMemoryItem: (content: string) => void;
  removeMemoryItem: (id: string) => void;
  clearAllData: () => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

const DEFAULT_SETTINGS: Settings = {
  tone: 'professional',
  length: 'detailed',
};

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [memory, setMemory] = useState<MemoryItem[]>([]);
  const [profession, setProfession] = useState<string | null>(null);

  // Load settings from localStorage on initial render
  useEffect(() => {
    try {
      const storedSettings = localStorage.getItem('ai_settings');
      if (storedSettings) {
        setSettings(JSON.parse(storedSettings));
      }
      const storedMemory = localStorage.getItem('ai_memory');
      if (storedMemory) {
        setMemory(JSON.parse(storedMemory));
      }
    } catch (error) {
      console.error("Failed to parse settings from localStorage", error);
      localStorage.removeItem('ai_settings');
      localStorage.removeItem('ai_memory');
    }
  }, []);

  // Detect profession from memory whenever it changes
  useEffect(() => {
    let detectedProfession: string | null = null;
    const lowerCaseMemory = memory.map(item => item.content.toLowerCase());

    for (const item of lowerCaseMemory) {
      if (item.includes('student')) {
        detectedProfession = 'student';
        break;
      }
      if (item.includes('seller')) {
        detectedProfession = 'seller';
        break;
      }
      if (item.includes('developer') || item.includes('programmer') || item.includes('engineer')) {
        detectedProfession = 'developer';
        break;
      }
    }
    setProfession(detectedProfession);
  }, [memory]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('ai_settings', JSON.stringify(updated));
      return updated;
    });
  };

  const addMemoryItem = (content: string) => {
    if (!content.trim()) return;
    const newItem: MemoryItem = { id: Date.now().toString(), content };
    setMemory(prev => {
      const updated = [...prev, newItem];
      localStorage.setItem('ai_memory', JSON.stringify(updated));
      return updated;
    });
  };

  const removeMemoryItem = (id: string) => {
    setMemory(prev => {
      const updated = prev.filter(item => item.id !== id);
      localStorage.setItem('ai_memory', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllData = () => {
    setSettings(DEFAULT_SETTINGS);
    setMemory([]);
    localStorage.removeItem('ai_settings');
    localStorage.removeItem('ai_memory');
  };

  return (
    <SettingsContext.Provider value={{ settings, memory, profession, updateSettings, addMemoryItem, removeMemoryItem, clearAllData }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
