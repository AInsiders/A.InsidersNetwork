import React, { useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragMoveEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import type { Block } from '@/types';
import { DraggableBlock } from './DraggableBlock';
import { DiscordPreview } from './DiscordPreview';

interface EmbedCanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  onBlockSelect: (id: string | null) => void;
  onBlockUpdate: (id: string, updates: Partial<Block>) => void;
  onBlockDelete: (id: string) => void;
  onBlockMove: (id: string, x: number, y: number) => void;
  onDragStart: (id: string, offset: { x: number; y: number }) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  onDragMove: (id: string, x: number, y: number) => void;
  isDragging: boolean;
  draggedBlockId: string | null;
}

export function EmbedCanvas({
  blocks,
  selectedBlockId,
  showGrid,
  snapToGrid,
  zoom,
  onBlockSelect,
  onBlockUpdate,
  onBlockDelete,
  onBlockMove,
  onDragStart,
  onDragEnd,
  onDragMove,
  isDragging,
  draggedBlockId,
}: EmbedCanvasProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const blockId = active.id as string;
    
    // Calculate offset from block center
    const block = blocks.find(b => b.id === blockId);
    if (block) {
      const offset = {
        x: event.activatorEvent.clientX - (block.x + block.w / 2),
        y: event.activatorEvent.clientY - (block.y + block.h / 2),
      };
      onDragStart(blockId, offset);
    }
  }, [blocks, onDragStart]);

  const handleDragMove = useCallback((event: DragMoveEvent) => {
    const { active, delta } = event;
    const blockId = active.id as string;
    
    // Convert delta to grid coordinates
    const gridDelta = {
      x: delta.x / (zoom / 100),
      y: delta.y / (zoom / 100),
    };
    
    onDragMove(blockId, gridDelta.x, gridDelta.y);
  }, [zoom, onDragMove]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, delta } = event;
    const blockId = active.id as string;
    
    // Convert final position to grid coordinates
    const finalDelta = {
      x: delta.x / (zoom / 100),
      y: delta.y / (zoom / 100),
    };
    
    onDragEnd(blockId, finalDelta.x, finalDelta.y);
  }, [zoom, onDragEnd]);

  const handleBlockClick = useCallback((blockId: string) => {
    onBlockSelect(blockId);
  }, [onBlockSelect]);

  const handleCanvasClick = useCallback((event: React.MouseEvent) => {
    // Only deselect if clicking on canvas background
    if (event.target === event.currentTarget) {
      onBlockSelect(null);
    }
  }, [onBlockSelect]);

  // Group blocks by zone
  const headerBlocks = blocks.filter(b => b.zone === 'header');
  const bodyBlocks = blocks.filter(b => b.zone === 'body');
  const sideBlocks = blocks.filter(b => b.zone === 'side');
  const footerBlocks = blocks.filter(b => b.zone === 'footer');

  return (
    <div className="w-full h-full relative">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <div
          className="w-full h-full relative bg-discord-darker rounded-lg p-4 cursor-default"
          onClick={handleCanvasClick}
        >
          {/* Discord-like preview background */}
          <div className="absolute inset-0 bg-discord-dark rounded-lg opacity-20" />
          
          {/* Canvas content */}
          <div className="relative z-10 w-full h-full">
            {/* Header zone */}
            <div className="relative min-h-[40px] mb-4">
              <SortableContext items={headerBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {headerBlocks.map(block => (
                  <DraggableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    isDragging={isDragging && draggedBlockId === block.id}
                    onSelect={handleBlockClick}
                    onUpdate={onBlockUpdate}
                    onDelete={onBlockDelete}
                    onMove={onBlockMove}
                  />
                ))}
              </SortableContext>
            </div>

            {/* Body and side zones */}
            <div className="flex gap-4">
              {/* Body zone */}
              <div className="flex-1 relative min-h-[200px]">
                <SortableContext items={bodyBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {bodyBlocks.map(block => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      isDragging={isDragging && draggedBlockId === block.id}
                      onSelect={handleBlockClick}
                      onUpdate={onBlockUpdate}
                      onDelete={onBlockDelete}
                      onMove={onBlockMove}
                    />
                  ))}
                </SortableContext>
              </div>

              {/* Side zone */}
              <div className="w-20 relative min-h-[200px]">
                <SortableContext items={sideBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  {sideBlocks.map(block => (
                    <DraggableBlock
                      key={block.id}
                      block={block}
                      isSelected={selectedBlockId === block.id}
                      isDragging={isDragging && draggedBlockId === block.id}
                      onSelect={handleBlockClick}
                      onUpdate={onBlockUpdate}
                      onDelete={onBlockDelete}
                      onMove={onBlockMove}
                    />
                  ))}
                </SortableContext>
              </div>
            </div>

            {/* Footer zone */}
            <div className="relative min-h-[40px] mt-4">
              <SortableContext items={footerBlocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                {footerBlocks.map(block => (
                  <DraggableBlock
                    key={block.id}
                    block={block}
                    isSelected={selectedBlockId === block.id}
                    isDragging={isDragging && draggedBlockId === block.id}
                    onSelect={handleBlockClick}
                    onUpdate={onBlockUpdate}
                    onDelete={onBlockDelete}
                    onMove={onBlockMove}
                  />
                ))}
              </SortableContext>
            </div>
          </div>

          {/* Live Discord preview */}
          <div className="absolute top-4 right-4 w-80">
            <DiscordPreview blocks={blocks} />
          </div>
        </div>
      </DndContext>
    </div>
  );
}
