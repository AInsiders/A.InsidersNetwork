import type { Block, BlockType, ZoneType } from '@/types';
import { GRID } from './layout';

// Block type configurations
export const BLOCK_CONFIGS = {
  title: {
    name: 'Title',
    description: 'Embed title with optional URL',
    icon: '📝',
    defaultWidth: 400,
    defaultHeight: 32,
    defaultZone: 'header' as ZoneType,
  },
  description: {
    name: 'Description',
    description: 'Main embed description with markdown support',
    icon: '📄',
    defaultWidth: 400,
    defaultHeight: 80,
    defaultZone: 'body' as ZoneType,
  },
  author: {
    name: 'Author',
    description: 'Author name, URL, and icon',
    icon: '👤',
    defaultWidth: 300,
    defaultHeight: 24,
    defaultZone: 'header' as ZoneType,
  },
  footer: {
    name: 'Footer',
    description: 'Footer text and icon',
    icon: '📌',
    defaultWidth: 300,
    defaultHeight: 24,
    defaultZone: 'footer' as ZoneType,
  },
  thumbnail: {
    name: 'Thumbnail',
    description: 'Small image thumbnail',
    icon: '🖼️',
    defaultWidth: 80,
    defaultHeight: 80,
    defaultZone: 'side' as ZoneType,
  },
  image: {
    name: 'Image',
    description: 'Large embed image',
    icon: '🖼️',
    defaultWidth: 400,
    defaultHeight: 200,
    defaultZone: 'body' as ZoneType,
  },
  url: {
    name: 'URL',
    description: 'Clickable URL for title',
    icon: '🔗',
    defaultWidth: 200,
    defaultHeight: 24,
    defaultZone: 'header' as ZoneType,
  },
  timestamp: {
    name: 'Timestamp',
    description: 'Embed timestamp',
    icon: '⏰',
    defaultWidth: 150,
    defaultHeight: 24,
    defaultZone: 'footer' as ZoneType,
  },
  field: {
    name: 'Field',
    description: 'Name-value field pair',
    icon: '📋',
    defaultWidth: 200,
    defaultHeight: 60,
    defaultZone: 'body' as ZoneType,
  },
} as const;

// Generate unique ID
function generateId(): string {
  return crypto.randomUUID();
}

// Calculate position for new block
function calculatePosition(type: BlockType, existingBlocks: Block[]): { x: number; y: number } {
  const config = BLOCK_CONFIGS[type];
  const zoneBlocks = existingBlocks.filter(b => b.zone === config.defaultZone);
  
  if (zoneBlocks.length === 0) {
    // First block in zone
    return { x: 0, y: 0 };
  }
  
  // Find the lowest block in the zone
  const lowestBlock = zoneBlocks.reduce((lowest, block) => 
    block.y + block.h > lowest.y + lowest.h ? block : lowest
  );
  
  return {
    x: 0, // Align to left
    y: lowestBlock.y + lowestBlock.h + GRID, // Place below with gap
  };
}

// Create a new block
export function createBlock(type: BlockType, existingBlocks: Block[] = []): Block {
  const config = BLOCK_CONFIGS[type];
  const position = calculatePosition(type, existingBlocks);
  
  const baseBlock = {
    id: generateId(),
    type,
    x: position.x,
    y: position.y,
    w: config.defaultWidth,
    h: config.defaultHeight,
    zone: config.defaultZone,
  };
  
  switch (type) {
    case 'title':
      return {
        ...baseBlock,
        text: 'New Title',
      };
      
    case 'description':
      return {
        ...baseBlock,
        markdown: 'Enter your description here...',
      };
      
    case 'author':
      return {
        ...baseBlock,
        name: 'Author Name',
        url: '',
        iconUrl: '',
      };
      
    case 'footer':
      return {
        ...baseBlock,
        text: 'Footer text',
        iconUrl: '',
      };
      
    case 'thumbnail':
      return {
        ...baseBlock,
        url: 'https://example.com/thumbnail.png',
      };
      
    case 'image':
      return {
        ...baseBlock,
        url: 'https://example.com/image.png',
      };
      
    case 'url':
      return {
        ...baseBlock,
        href: 'https://example.com',
      };
      
    case 'timestamp':
      return {
        ...baseBlock,
        enabled: true,
      };
      
    case 'field':
      return {
        ...baseBlock,
        name: 'Field Name',
        value: 'Field Value',
        inline: false,
      };
      
    default:
      throw new Error(`Unknown block type: ${type}`);
  }
}

// Create preset blocks
export function createPresetBlocks(presetType: 'announcement' | 'patch' | 'giveaway' | 'alert'): Block[] {
  switch (presetType) {
    case 'announcement':
      return [
        createBlock('title', []),
        createBlock('description', []),
        createBlock('author', []),
        createBlock('footer', []),
      ];
      
    case 'patch':
      return [
        createBlock('title', []),
        createBlock('description', []),
        createBlock('field', []),
        createBlock('field', []),
        createBlock('footer', []),
      ];
      
    case 'giveaway':
      return [
        createBlock('title', []),
        createBlock('description', []),
        createBlock('field', []),
        createBlock('field', []),
        createBlock('field', []),
        createBlock('footer', []),
      ];
      
    case 'alert':
      return [
        createBlock('title', []),
        createBlock('description', []),
        createBlock('footer', []),
      ];
      
    default:
      return [];
  }
}

// Duplicate a block
export function duplicateBlock(block: Block, existingBlocks: Block[]): Block {
  const position = calculatePosition(block.type, existingBlocks);
  
  return {
    ...block,
    id: generateId(),
    x: position.x,
    y: position.y,
  };
}

// Get block display name
export function getBlockDisplayName(type: BlockType): string {
  return BLOCK_CONFIGS[type].name;
}

// Get block description
export function getBlockDescription(type: BlockType): string {
  return BLOCK_CONFIGS[type].description;
}

// Get block icon
export function getBlockIcon(type: BlockType): string {
  return BLOCK_CONFIGS[type].icon;
}
