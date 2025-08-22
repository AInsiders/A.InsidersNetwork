import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Undo2,
  Redo2,
  Grid3X3,
  Magnet,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Monitor,
  Settings,
} from 'lucide-react';
import type { BlockType } from '@/types';
import { BLOCK_CONFIGS } from '@/lib/blocks';

interface ToolbarProps {
  onAddBlock: (type: BlockType) => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  onToggleGrid: () => void;
  onToggleSnap: () => void;
  onZoomChange: (zoom: number) => void;
  onThemeChange: (theme: 'light' | 'dark' | 'system') => void;
  theme: 'light' | 'dark' | 'system';
}

export function Toolbar({
  onAddBlock,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  showGrid,
  snapToGrid,
  zoom,
  onToggleGrid,
  onToggleSnap,
  onZoomChange,
  onThemeChange,
  theme,
}: ToolbarProps) {
  const [showBlockMenu, setShowBlockMenu] = useState(false);

  const handleAddBlock = (type: BlockType) => {
    onAddBlock(type);
    setShowBlockMenu(false);
  };

  const handleZoomIn = () => {
    onZoomChange(Math.min(150, zoom + 10));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(75, zoom - 10));
  };

  const handleZoomReset = () => {
    onZoomChange(100);
  };

  return (
    <div className="border-b bg-card p-4 space-y-4">
      {/* Add Block Button */}
      <div className="relative">
        <button
          onClick={() => setShowBlockMenu(!showBlockMenu)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Block
        </button>

        <AnimatePresence>
          {showBlockMenu && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-popover border rounded-md shadow-lg z-50"
            >
              <div className="p-2 space-y-1">
                {Object.entries(BLOCK_CONFIGS).map(([type, config]) => (
                  <button
                    key={type}
                    onClick={() => handleAddBlock(type as BlockType)}
                    className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-accent rounded-sm transition-colors"
                  >
                    <span className="text-lg">{config.icon}</span>
                    <div>
                      <div className="font-medium">{config.name}</div>
                      <div className="text-xs text-muted-foreground">{config.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Undo/Redo */}
      <div className="flex gap-1">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="w-3 h-3" />
          Undo
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo2 className="w-3 h-3" />
          Redo
        </button>
      </div>

      {/* Grid Controls */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Canvas</div>
        <div className="flex gap-1">
          <button
            onClick={onToggleGrid}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded transition-colors ${
              showGrid
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            title="Toggle Grid"
          >
            <Grid3X3 className="w-3 h-3" />
            Grid
          </button>
          <button
            onClick={onToggleSnap}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded transition-colors ${
              snapToGrid
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            title="Toggle Snap to Grid"
          >
            <Magnet className="w-3 h-3" />
            Snap
          </button>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Zoom</div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="flex items-center justify-center w-8 h-8 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-3 h-3" />
          </button>
          <div className="flex-1 text-center text-sm font-medium">
            {zoom}%
          </div>
          <button
            onClick={handleZoomIn}
            className="flex items-center justify-center w-8 h-8 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-3 h-3" />
          </button>
        </div>
        <button
          onClick={handleZoomReset}
          className="w-full px-2 py-1 text-xs bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
        >
          Reset
        </button>
      </div>

      {/* Theme Controls */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Theme</div>
        <div className="flex gap-1">
          <button
            onClick={() => onThemeChange('light')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded transition-colors ${
              theme === 'light'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            title="Light Theme"
          >
            <Sun className="w-3 h-3" />
            Light
          </button>
          <button
            onClick={() => onThemeChange('dark')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded transition-colors ${
              theme === 'dark'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            title="Dark Theme"
          >
            <Moon className="w-3 h-3" />
            Dark
          </button>
          <button
            onClick={() => onThemeChange('system')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded transition-colors ${
              theme === 'system'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
            title="System Theme"
          >
            <Monitor className="w-3 h-3" />
            Auto
          </button>
        </div>
      </div>
    </div>
  );
}
