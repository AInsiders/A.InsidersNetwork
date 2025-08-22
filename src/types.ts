// Block types
export type BlockType =
  | "title"
  | "description"
  | "author"
  | "footer"
  | "thumbnail"
  | "image"
  | "url"
  | "timestamp"
  | "field";

// Zone types
export type ZoneType = "header" | "body" | "side" | "footer";

// Base block interface
export interface BlockBase {
  id: string;
  type: BlockType;
  x: number; // grid units
  y: number; // grid units
  w: number; // width in px
  h: number; // height in px
  zone: ZoneType;
}

// Specific block types
export interface TitleBlock extends BlockBase {
  type: "title";
  text: string;
}

export interface DescriptionBlock extends BlockBase {
  type: "description";
  markdown: string;
}

export interface AuthorBlock extends BlockBase {
  type: "author";
  name: string;
  url?: string;
  iconUrl?: string;
}

export interface FooterBlock extends BlockBase {
  type: "footer";
  text: string;
  iconUrl?: string;
}

export interface ThumbnailBlock extends BlockBase {
  type: "thumbnail";
  url: string;
}

export interface ImageBlock extends BlockBase {
  type: "image";
  url: string;
}

export interface UrlBlock extends BlockBase {
  type: "url";
  href: string;
}

export interface TimestampBlock extends BlockBase {
  type: "timestamp";
  enabled: boolean;
}

export interface FieldBlock extends BlockBase {
  type: "field";
  name: string;
  value: string;
  inline: boolean;
}

// Union type for all blocks
export type Block =
  | TitleBlock
  | DescriptionBlock
  | AuthorBlock
  | FooterBlock
  | ThumbnailBlock
  | ImageBlock
  | UrlBlock
  | TimestampBlock
  | FieldBlock;

// Main embed state
export interface EmbedState {
  colorHex: string; // e.g. '#ff0000'
  blocks: Block[];
}

// App state
export interface AppState {
  embed: EmbedState;
  selectedBlockId: string | null;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  theme: 'light' | 'dark' | 'system';
  autoSave: boolean;
  history: {
    past: EmbedState[];
    future: EmbedState[];
  };
}

// Drag and drop types
export interface DragState {
  isDragging: boolean;
  draggedBlockId: string | null;
  dragOffset: { x: number; y: number };
}

// Snap guide type
export interface SnapGuide {
  type: 'horizontal' | 'vertical';
  position: number;
  length: number;
}

// Preset template
export interface EmbedPreset {
  id: string;
  name: string;
  description: string;
  color: string;
  blocks: Block[];
}

// Export formats
export interface ExportData {
  embed: any; // Discord embed format
  webhook: any; // Webhook payload format
  markdown: string; // Markdown summary
}

// UI component props
export interface BlockProps {
  block: Block;
  isSelected: boolean;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Block>) => void;
  onDelete: (id: string) => void;
}

export interface CanvasProps {
  blocks: Block[];
  selectedBlockId: string | null;
  showGrid: boolean;
  snapToGrid: boolean;
  zoom: number;
  onBlockSelect: (id: string | null) => void;
  onBlockUpdate: (id: string, updates: Partial<Block>) => void;
  onBlockDelete: (id: string) => void;
  onBlockMove: (id: string, x: number, y: number) => void;
}

export interface ToolbarProps {
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

export interface PropertiesProps {
  selectedBlock: Block | null;
  onUpdate: (updates: Partial<Block>) => void;
  onDelete: () => void;
}

export interface ExportPanelProps {
  embed: EmbedState;
  onExport: (format: 'embed' | 'webhook' | 'markdown') => void;
}

// Utility types
export type BlockTypeConfig = {
  [K in BlockType]: {
    name: string;
    description: string;
    icon: string;
    defaultWidth: number;
    defaultHeight: number;
    defaultZone: ZoneType;
  };
};

// Event types
export interface BlockEvent {
  type: 'select' | 'update' | 'delete' | 'move';
  blockId: string;
  data?: any;
}

export interface CanvasEvent {
  type: 'blockSelect' | 'blockUpdate' | 'blockDelete' | 'blockMove';
  blockId: string;
  data?: any;
}
