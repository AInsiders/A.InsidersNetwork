import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, X } from 'lucide-react';
import type { Block } from '@/types';
import { getBlockIcon, getBlockDisplayName } from '@/lib/blocks';

interface DraggableBlockProps {
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, x: number, y: number) => void;
}

export function DraggableBlock({
  block,
  isSelected,
  isDragging,
  onSelect,
  onUpdate,
  onDelete,
  onMove,
}: DraggableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(block.id);
  }, [block.id, onSelect]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(block.id);
  }, [block.id, onDelete]);

  const handleDragHandleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Get block content based on type
  const getBlockContent = () => {
    switch (block.type) {
      case 'title':
        return (
          <div className="text-sm font-semibold text-white truncate">
            {block.text || 'Title'}
          </div>
        );
        
      case 'description':
        return (
          <div className="text-sm text-gray-300 line-clamp-3">
            {block.markdown || 'Description'}
          </div>
        );
        
      case 'author':
        return (
          <div className="flex items-center gap-2">
            {block.iconUrl && (
              <img src={block.iconUrl} alt="" className="w-4 h-4 rounded-full" />
            )}
            <span className="text-sm text-gray-400">
              {block.name || 'Author'}
            </span>
          </div>
        );
        
      case 'footer':
        return (
          <div className="flex items-center gap-2">
            {block.iconUrl && (
              <img src={block.iconUrl} alt="" className="w-4 h-4 rounded-full" />
            )}
            <span className="text-xs text-gray-400">
              {block.text || 'Footer'}
            </span>
          </div>
        );
        
      case 'thumbnail':
        return (
          <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center">
            <span className="text-xs text-gray-400">Thumbnail</span>
          </div>
        );
        
      case 'image':
        return (
          <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center">
            <span className="text-xs text-gray-400">Image</span>
          </div>
        );
        
      case 'url':
        return (
          <div className="text-sm text-blue-400 underline truncate">
            {block.href || 'URL'}
          </div>
        );
        
      case 'timestamp':
        return (
          <div className="text-xs text-gray-400">
            {block.enabled ? 'Timestamp enabled' : 'Timestamp disabled'}
          </div>
        );
        
      case 'field':
        return (
          <div className="space-y-1">
            <div className="text-sm font-semibold text-white truncate">
              {block.name || 'Field Name'}
            </div>
            <div className="text-sm text-gray-300 line-clamp-2">
              {block.value || 'Field Value'}
            </div>
            {block.inline && (
              <div className="text-xs text-gray-500">Inline</div>
            )}
          </div>
        );
        
      default:
        return <div>Unknown block type</div>;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        absolute draggable-block
        ${isSelected ? 'selected' : ''}
        ${isDragging || isSortableDragging ? 'dragging' : ''}
        bg-discord-light border border-discord-lighter rounded-md p-3
        cursor-move select-none
        hover:border-primary/50 transition-all duration-200
        ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-discord-darker' : ''}
        ${isDragging || isSortableDragging ? 'opacity-50 z-50' : ''}
      `}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.2 }}
      onClick={handleClick}
      {...attributes}
      {...listeners}
    >
      {/* Block header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{getBlockIcon(block.type)}</span>
          <span className="text-xs font-medium text-gray-300">
            {getBlockDisplayName(block.type)}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Drag handle */}
          <div
            className="p-1 hover:bg-discord-lighter rounded cursor-grab active:cursor-grabbing"
            onMouseDown={handleDragHandleMouseDown}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-3 h-3 text-gray-400" />
          </div>
          
          {/* Delete button */}
          <button
            className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded transition-colors"
            onClick={handleDelete}
            title="Delete block"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Block content */}
      <div className="min-h-[20px]">
        {getBlockContent()}
      </div>

      {/* Block dimensions indicator */}
      <div className="absolute bottom-1 right-1 text-xs text-gray-500 pointer-events-none">
        {block.w}×{block.h}
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute inset-0 border-2 border-primary rounded-md pointer-events-none" />
      )}
    </motion.div>
  );
}
