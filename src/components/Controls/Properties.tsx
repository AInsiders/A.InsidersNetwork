import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Copy, Settings } from 'lucide-react';
import type { Block } from '@/types';
import { EMBED_LIMITS } from '@/lib/schema';
import { getMarkdownLength } from '@/lib/markdown';

interface PropertiesProps {
  selectedBlock: Block | null;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
}

export function Properties({ selectedBlock, onUpdate, onDelete }: PropertiesProps) {
  const [localValues, setLocalValues] = useState<Partial<Block>>({});

  // Update local values when selected block changes
  useEffect(() => {
    if (selectedBlock) {
      setLocalValues(selectedBlock);
    } else {
      setLocalValues({});
    }
  }, [selectedBlock]);

  const handleInputChange = (field: string, value: any) => {
    const updates = { [field]: value };
    setLocalValues(prev => ({ ...prev, ...updates }));
    onUpdate(updates);
  };

  const handleBlur = () => {
    // Apply all local changes
    onUpdate(localValues);
  };

  if (!selectedBlock) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Settings className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Select a block to edit its properties</p>
      </div>
    );
  }

  const renderBlockProperties = () => {
    switch (selectedBlock.type) {
      case 'title':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Title</label>
              <input
                type="text"
                value={localValues.text || ''}
                onChange={(e) => handleInputChange('text', e.target.value)}
                onBlur={handleBlur}
                maxLength={EMBED_LIMITS.TITLE_MAX}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter title..."
              />
              <div className="text-xs text-muted-foreground mt-1">
                {localValues.text?.length || 0}/{EMBED_LIMITS.TITLE_MAX}
              </div>
            </div>
          </div>
        );

      case 'description':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Description</label>
              <textarea
                value={localValues.markdown || ''}
                onChange={(e) => handleInputChange('markdown', e.target.value)}
                onBlur={handleBlur}
                maxLength={EMBED_LIMITS.DESCRIPTION_MAX}
                rows={4}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Enter description (markdown supported)..."
              />
              <div className="text-xs text-muted-foreground mt-1">
                {getMarkdownLength(localValues.markdown || '')}/{EMBED_LIMITS.DESCRIPTION_MAX}
              </div>
            </div>
          </div>
        );

      case 'author':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={localValues.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={handleBlur}
                maxLength={EMBED_LIMITS.AUTHOR_NAME_MAX}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Author name..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">URL</label>
              <input
                type="url"
                value={localValues.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Icon URL</label>
              <input
                type="url"
                value={localValues.iconUrl || ''}
                onChange={(e) => handleInputChange('iconUrl', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com/icon.png"
              />
            </div>
          </div>
        );

      case 'footer':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Text</label>
              <input
                type="text"
                value={localValues.text || ''}
                onChange={(e) => handleInputChange('text', e.target.value)}
                onBlur={handleBlur}
                maxLength={EMBED_LIMITS.FOOTER_TEXT_MAX}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Footer text..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Icon URL</label>
              <input
                type="url"
                value={localValues.iconUrl || ''}
                onChange={(e) => handleInputChange('iconUrl', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com/icon.png"
              />
            </div>
          </div>
        );

      case 'thumbnail':
      case 'image':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">URL</label>
              <input
                type="url"
                value={localValues.url || ''}
                onChange={(e) => handleInputChange('url', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com/image.png"
              />
            </div>
          </div>
        );

      case 'url':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">URL</label>
              <input
                type="url"
                value={localValues.href || ''}
                onChange={(e) => handleInputChange('href', e.target.value)}
                onBlur={handleBlur}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="https://example.com"
              />
            </div>
          </div>
        );

      case 'timestamp':
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localValues.enabled || false}
                onChange={(e) => handleInputChange('enabled', e.target.checked)}
                onBlur={handleBlur}
                className="rounded"
              />
              <label className="text-sm">Enable timestamp</label>
            </div>
          </div>
        );

      case 'field':
        return (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Name</label>
              <input
                type="text"
                value={localValues.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                onBlur={handleBlur}
                maxLength={EMBED_LIMITS.FIELD_NAME_MAX}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Field name..."
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Value</label>
              <textarea
                value={localValues.value || ''}
                onChange={(e) => handleInputChange('value', e.target.value)}
                onBlur={handleBlur}
                maxLength={EMBED_LIMITS.FIELD_VALUE_MAX}
                rows={3}
                className="w-full px-2 py-1 text-sm bg-background border rounded focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                placeholder="Field value..."
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={localValues.inline || false}
                onChange={(e) => handleInputChange('inline', e.target.checked)}
                onBlur={handleBlur}
                className="rounded"
              />
              <label className="text-sm">Inline field</label>
            </div>
          </div>
        );

      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="p-4 space-y-4"
    >
      {/* Block header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-medium">{selectedBlock.type.charAt(0).toUpperCase() + selectedBlock.type.slice(1)}</h3>
          <p className="text-xs text-muted-foreground">Block Properties</p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedBlock, null, 2))}
            className="p-1 hover:bg-secondary rounded transition-colors"
            title="Copy block data"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 hover:bg-destructive/20 hover:text-destructive rounded transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block properties */}
      <div className="space-y-4">
        {renderBlockProperties()}
      </div>

      {/* Position info */}
      <div className="pt-4 border-t">
        <div className="text-xs font-medium text-muted-foreground mb-2">Position</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">X:</span> {selectedBlock.x}
          </div>
          <div>
            <span className="text-muted-foreground">Y:</span> {selectedBlock.y}
          </div>
          <div>
            <span className="text-muted-foreground">W:</span> {selectedBlock.w}
          </div>
          <div>
            <span className="text-muted-foreground">H:</span> {selectedBlock.h}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
