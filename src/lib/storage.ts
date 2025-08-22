import type { EmbedState } from '@/types';

const STORAGE_KEYS = {
  DRAFT: 'discord-embed-builder-draft',
  SETTINGS: 'discord-embed-builder-settings',
  HISTORY: 'discord-embed-builder-history',
} as const;

// Settings interface
export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  autoSave: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  showGrid: true,
  snapToGrid: true,
  zoom: 100,
  autoSave: true,
};

// Save draft to localStorage
export function saveDraft(state: EmbedState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save draft:', error);
  }
}

// Load draft from localStorage
export function loadDraft(): EmbedState | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.DRAFT);
    if (!saved) return null;
    
    const parsed = JSON.parse(saved);
    // Basic validation
    if (parsed && typeof parsed === 'object' && Array.isArray(parsed.blocks)) {
      return parsed;
    }
    return null;
  } catch (error) {
    console.warn('Failed to load draft:', error);
    return null;
  }
}

// Clear draft
export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  } catch (error) {
    console.warn('Failed to clear draft:', error);
  }
}

// Save settings
export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.warn('Failed to save settings:', error);
  }
}

// Load settings
export function loadSettings(): AppSettings {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!saved) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(saved);
    // Merge with defaults to handle missing properties
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (error) {
    console.warn('Failed to load settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// History management for undo/redo
export interface HistoryEntry {
  id: string;
  timestamp: number;
  state: EmbedState;
}

const MAX_HISTORY_SIZE = 50;

// Save to history
export function saveToHistory(state: EmbedState): void {
  try {
    const history = loadHistory();
    const newEntry: HistoryEntry = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)), // Deep clone
    };
    
    // Add new entry and limit size
    history.unshift(newEntry);
    if (history.length > MAX_HISTORY_SIZE) {
      history.pop();
    }
    
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.warn('Failed to save to history:', error);
  }
}

// Load history
export function loadHistory(): HistoryEntry[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
    if (!saved) return [];
    
    const parsed = JSON.parse(saved);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.warn('Failed to load history:', error);
    return [];
  }
}

// Clear history
export function clearHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.warn('Failed to clear history:', error);
  }
}

// Export all data
export function exportAllData(): Record<string, any> {
  return {
    draft: loadDraft(),
    settings: loadSettings(),
    history: loadHistory(),
  };
}

// Import all data
export function importAllData(data: Record<string, any>): void {
  try {
    if (data.draft) {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(data.draft));
    }
    if (data.settings) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
    }
    if (data.history) {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
    }
  } catch (error) {
    console.warn('Failed to import data:', error);
  }
}

// Clear all data
export function clearAllData(): void {
  try {
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (error) {
    console.warn('Failed to clear all data:', error);
  }
}
