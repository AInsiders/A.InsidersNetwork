import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EmbedCanvas } from './components/Canvas/EmbedCanvas';
import { Toolbar } from './components/Controls/Toolbar';
import { Properties } from './components/Controls/Properties';
import { ExportPanel } from './components/Controls/ExportPanel';
import { Presets } from './components/Controls/Presets';
import { GridOverlay } from './components/Canvas/GridOverlay';
import { Guides } from './components/Canvas/Guides';
import type { Block, BlockType, EmbedState, AppState } from './types';
import { loadDraft, saveDraft, loadSettings, saveSettings, saveToHistory } from './lib/storage';
import { onDragEnd, calculateSnapGuides, chooseCols } from './lib/layout';
import { generateRandomColor } from './lib/color';
import { createBlock } from './lib/blocks';

// Default embed state
const DEFAULT_EMBED: EmbedState = {
  colorHex: '#5865f2',
  blocks: [],
};

// Default app state
const DEFAULT_APP_STATE: AppState = {
  embed: DEFAULT_EMBED,
  selectedBlockId: null,
  showGrid: true,
  snapToGrid: true,
  zoom: 100,
  theme: 'system',
  autoSave: true,
  history: {
    past: [],
    future: [],
  },
};

function App() {
  const [appState, setAppState] = useState<AppState>(DEFAULT_APP_STATE);
  const [dragState, setDragState] = useState({ isDragging: false, draggedBlockId: null, dragOffset: { x: 0, y: 0 } });
  const [snapGuides, setSnapGuides] = useState<Array<{ type: 'horizontal' | 'vertical'; position: number; length: number }>>([]);

  // Load saved state on mount
  useEffect(() => {
    const savedDraft = loadDraft();
    const savedSettings = loadSettings();
    
    setAppState(prev => ({
      ...prev,
      embed: savedDraft || DEFAULT_EMBED,
      showGrid: savedSettings.showGrid,
      snapToGrid: savedSettings.snapToGrid,
      zoom: savedSettings.zoom,
      theme: savedSettings.theme,
      autoSave: savedSettings.autoSave,
    }));
  }, []);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (appState.theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.toggle('dark', systemTheme === 'dark');
    } else {
      root.classList.toggle('dark', appState.theme === 'dark');
    }
  }, [appState.theme]);

  // Auto-save
  useEffect(() => {
    if (appState.autoSave) {
      saveDraft(appState.embed);
      saveSettings({
        theme: appState.theme,
        showGrid: appState.showGrid,
        snapToGrid: appState.snapToGrid,
        zoom: appState.zoom,
        autoSave: appState.autoSave,
      });
    }
  }, [appState.embed, appState.theme, appState.showGrid, appState.snapToGrid, appState.zoom, appState.autoSave]);

  // Update embed state
  const updateEmbed = useCallback((updates: Partial<EmbedState>) => {
    setAppState(prev => {
      const newEmbed = { ...prev.embed, ...updates };
      
      // Save to history
      saveToHistory(prev.embed);
      
      return {
        ...prev,
        embed: newEmbed,
        history: {
          past: [...prev.history.past, prev.embed],
          future: [],
        },
      };
    });
  }, []);

  // Add block
  const addBlock = useCallback((type: BlockType) => {
    const newBlock = createBlock(type, appState.embed.blocks);
    updateEmbed({
      blocks: [...appState.embed.blocks, newBlock],
    });
    setAppState(prev => ({ ...prev, selectedBlockId: newBlock.id }));
  }, [appState.embed.blocks, updateEmbed]);

  // Update block
  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    updateEmbed({
      blocks: appState.embed.blocks.map(block =>
        block.id === id ? { ...block, ...updates } : block
      ),
    });
  }, [appState.embed.blocks, updateEmbed]);

  // Delete block
  const deleteBlock = useCallback((id: string) => {
    updateEmbed({
      blocks: appState.embed.blocks.filter(block => block.id !== id),
    });
    setAppState(prev => ({
      ...prev,
      selectedBlockId: prev.selectedBlockId === id ? null : prev.selectedBlockId,
    }));
  }, [updateEmbed]);

  // Move block
  const moveBlock = useCallback((id: string, x: number, y: number) => {
    updateBlock(id, { x, y });
  }, [updateBlock]);

  // Select block
  const selectBlock = useCallback((id: string | null) => {
    setAppState(prev => ({ ...prev, selectedBlockId: id }));
  }, []);

  // Handle drag start
  const handleDragStart = useCallback((id: string, offset: { x: number; y: number }) => {
    setDragState({ isDragging: true, draggedBlockId: id, dragOffset: offset });
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    const cols = chooseCols(window.innerWidth);
    const updatedBlocks = onDragEnd(id, [...appState.embed.blocks], cols);
    updateEmbed({ blocks: updatedBlocks });
    setDragState({ isDragging: false, draggedBlockId: null, dragOffset: { x: 0, y: 0 } });
    setSnapGuides([]);
  }, [appState.embed.blocks, updateEmbed]);

  // Handle drag move
  const handleDragMove = useCallback((id: string, x: number, y: number) => {
    if (appState.snapToGrid) {
      const movingBlock = appState.embed.blocks.find(b => b.id === id);
      if (movingBlock) {
        const siblings = appState.embed.blocks.filter(b => b.id !== id && b.zone === movingBlock.zone);
        const guides = calculateSnapGuides({ ...movingBlock, x, y }, siblings);
        setSnapGuides(guides);
      }
    }
  }, [appState.snapToGrid, appState.embed.blocks]);

  // Undo/Redo
  const undo = useCallback(() => {
    setAppState(prev => {
      if (prev.history.past.length === 0) return prev;
      
      const newPast = [...prev.history.past];
      const previousState = newPast.pop()!;
      
      return {
        ...prev,
        embed: previousState,
        history: {
          past: newPast,
          future: [prev.embed, ...prev.history.future],
        },
      };
    });
  }, []);

  const redo = useCallback(() => {
    setAppState(prev => {
      if (prev.history.future.length === 0) return prev;
      
      const newFuture = [...prev.history.future];
      const nextState = newFuture.shift()!;
      
      return {
        ...prev,
        embed: nextState,
        history: {
          past: [...prev.history.past, prev.embed],
          future: newFuture,
        },
      };
    });
  }, []);

  // Toggle settings
  const toggleGrid = useCallback(() => {
    setAppState(prev => ({ ...prev, showGrid: !prev.showGrid }));
  }, []);

  const toggleSnap = useCallback(() => {
    setAppState(prev => ({ ...prev, snapToGrid: !prev.snapToGrid }));
  }, []);

  const setZoom = useCallback((zoom: number) => {
    setAppState(prev => ({ ...prev, zoom: Math.max(75, Math.min(150, zoom)) }));
  }, []);

  const setTheme = useCallback((theme: 'light' | 'dark' | 'system') => {
    setAppState(prev => ({ ...prev, theme }));
  }, []);

  // Load preset
  const loadPreset = useCallback((preset: EmbedState) => {
    updateEmbed(preset);
    setAppState(prev => ({ ...prev, selectedBlockId: null }));
  }, [updateEmbed]);

  // Clear embed
  const clearEmbed = useCallback(() => {
    updateEmbed(DEFAULT_EMBED);
    setAppState(prev => ({ ...prev, selectedBlockId: null }));
  }, [updateEmbed]);

  const selectedBlock = appState.embed.blocks.find(b => b.id === appState.selectedBlockId) || null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">Discord Embed Builder</h1>
              <span className="text-sm text-muted-foreground">Advanced Drag & Drop</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={clearEmbed}
                className="px-3 py-1.5 text-sm bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 transition-colors"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Controls */}
        <div className="w-80 border-r bg-card flex flex-col">
          <Toolbar
            onAddBlock={addBlock}
            onUndo={undo}
            onRedo={redo}
            canUndo={appState.history.past.length > 0}
            canRedo={appState.history.future.length > 0}
            showGrid={appState.showGrid}
            snapToGrid={appState.snapToGrid}
            zoom={appState.zoom}
            onToggleGrid={toggleGrid}
            onToggleSnap={toggleSnap}
            onZoomChange={setZoom}
            onThemeChange={setTheme}
            theme={appState.theme}
          />
          
          <div className="flex-1 overflow-y-auto">
            <Properties
              selectedBlock={selectedBlock}
              onUpdate={(updates) => selectedBlock && updateBlock(selectedBlock.id, updates)}
              onDelete={() => selectedBlock && deleteBlock(selectedBlock.id)}
            />
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 relative overflow-hidden">
            <div
              className="w-full h-full relative"
              style={{
                transform: `scale(${appState.zoom / 100})`,
                transformOrigin: 'top left',
              }}
            >
              <EmbedCanvas
                blocks={appState.embed.blocks}
                selectedBlockId={appState.selectedBlockId}
                showGrid={appState.showGrid}
                snapToGrid={appState.snapToGrid}
                zoom={appState.zoom}
                onBlockSelect={selectBlock}
                onBlockUpdate={updateBlock}
                onBlockDelete={deleteBlock}
                onBlockMove={moveBlock}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragMove={handleDragMove}
                isDragging={dragState.isDragging}
                draggedBlockId={dragState.draggedBlockId}
              />
              
              {appState.showGrid && <GridOverlay />}
              <Guides guides={snapGuides} />
            </div>
          </div>
        </div>

        {/* Right Sidebar - Export & Presets */}
        <div className="w-80 border-l bg-card flex flex-col">
          <ExportPanel
            embed={appState.embed}
            onExport={(format) => {
              // Export logic will be implemented
              console.log('Export:', format);
            }}
          />
          
          <div className="flex-1 overflow-y-auto">
            <Presets onLoadPreset={loadPreset} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
