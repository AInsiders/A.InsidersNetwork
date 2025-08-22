import type { Block } from '@/types';

// Grid and layout constants
export const GRID = 8;
export const SNAP_PX = 6;          // edge snap tolerance
export const ZONE_INNER_W = 560;   // px width of the embed body zone
export const MIN_BLOCK_H = GRID * 4;

// Column width calculation
export const colFor = (cols: 1|2|3) => Math.floor(ZONE_INNER_W / cols / GRID) * GRID;

// Basic grid snap
export const snapToGrid = (n: number, g = GRID) => Math.round(n / g) * g;

// Edge snapping to siblings
export function snapToSiblings(moving: Block, siblings: Block[]) {
  let { x, y, w, h } = moving; // px
  const edgesMoving = { 
    l: x, 
    r: x + w, 
    t: y, 
    b: y + h, 
    cx: x + w / 2,
    cy: y + h / 2
  };

  for (const s of siblings) {
    if (s.id === moving.id) continue;
    const edgesSib = { 
      l: s.x, 
      r: s.x + s.w, 
      t: s.y, 
      b: s.y + s.h, 
      cx: s.x + s.w / 2,
      cy: s.y + s.h / 2
    };

    // Horizontal edge snaps
    if (Math.abs(edgesMoving.l - edgesSib.r) <= SNAP_PX) x = s.x + s.w;       // attach to right
    if (Math.abs(edgesMoving.r - edgesSib.l) <= SNAP_PX) x = s.x - w;         // attach to left
    
    // Vertical edge snaps
    if (Math.abs(edgesMoving.t - edgesSib.b) <= SNAP_PX) y = s.y + s.h;       // stack below
    if (Math.abs(edgesMoving.b - edgesSib.t) <= SNAP_PX) y = s.y - h;         // stack above
    
    // Center line snaps
    if (Math.abs(edgesMoving.cx - edgesSib.cx) <= SNAP_PX) x = s.x + (s.w - w) / 2;
    if (Math.abs(edgesMoving.cy - edgesSib.cy) <= SNAP_PX) y = s.y + (s.h - h) / 2;
  }
  
  return { x: snapToGrid(x), y: snapToGrid(y) };
}

// Enforce equal width per zone
export function enforceEqualWidth(blocks: Block[], cols: 1|2|3 = 1) {
  const targetW = colFor(cols); // px
  return blocks.map(b => ({ ...b, w: targetW }));
}

// Back-to-back vertical packing (remove gaps)
export function verticalPack(blocks: Block[], cols: 1|2|3 = 1) {
  const colW = colFor(cols);
  
  // Assign columns by nearest column start
  const colStarts = Array.from({ length: cols }, (_, i) => i * colW);
  const byCol: Block[][] = Array.from({ length: cols }, () => []);
  
  for (const b of blocks) {
    const idx = Math.min(
      cols - 1,
      colStarts
        .map((sx, i) => ({ i, d: Math.abs(b.x - sx) }))
        .sort((a, b) => a.d - b.d)[0].i
    );
    const x = colStarts[idx];
    byCol[idx].push({ ...b, x });
  }

  // Pack each column
  const packed: Block[] = [];
  for (const col of byCol) {
    col.sort((a, b) => (a.y - b.y) || (a.x - b.x));
    let cursorY = 0;
    for (const b of col) {
      const h = Math.max(b.h, MIN_BLOCK_H);
      packed.push({ ...b, y: cursorY, h });
      cursorY += h; // back-to-back
    }
  }
  
  return packed;
}

// Auto-columns based on canvas width
export function chooseCols(canvasPx: number): 1|2|3 {
  if (canvasPx >= 520) return 3;
  if (canvasPx >= 360) return 2;
  return 1;
}

// Full drag end pipeline
export function onDragEnd(movingId: string, draft: Block[], cols: 1|2|3 = 1) {
  const moving = draft.find(b => b.id === movingId)!;
  const siblings = draft.filter(b => b.id !== movingId && b.zone === moving.zone);

  // 1) edge snap to siblings
  const pos = snapToSiblings(moving, siblings);
  moving.x = pos.x;
  moving.y = pos.y;

  // 2) clamp within zone and snap X/Y to grid
  moving.x = Math.max(0, Math.min(moving.x, ZONE_INNER_W - moving.w));
  moving.y = Math.max(0, moving.y);
  moving.x = snapToGrid(moving.x);
  moving.y = snapToGrid(moving.y);

  // 3) equalize widths for all blocks in this zone
  const zoneBlocks = draft.filter(b => b.zone === moving.zone);
  const equalized = enforceEqualWidth(zoneBlocks, cols);

  // 4) pack vertically so everything is back-to-back
  const packed = verticalPack(equalized, cols);

  // 5) write back
  const packedIds = new Set(packed.map(b => b.id));
  return draft.map(b => packedIds.has(b.id) ? packed.find(p => p.id === b.id)! : b);
}

// Calculate snap guides
export function calculateSnapGuides(moving: Block, siblings: Block[]) {
  const guides: Array<{ type: 'horizontal' | 'vertical'; position: number; length: number }> = [];
  const { x, y, w, h } = moving;
  const edgesMoving = { l: x, r: x + w, t: y, b: y + h, cx: x + w / 2, cy: y + h / 2 };

  for (const s of siblings) {
    if (s.id === moving.id) continue;
    const edgesSib = { l: s.x, r: s.x + s.w, t: s.y, b: s.y + s.h, cx: s.x + s.w / 2, cy: s.y + s.h / 2 };

    // Horizontal guides
    if (Math.abs(edgesMoving.t - edgesSib.t) <= SNAP_PX) {
      guides.push({ type: 'horizontal', position: edgesSib.t, length: Math.max(w, s.w) });
    }
    if (Math.abs(edgesMoving.b - edgesSib.b) <= SNAP_PX) {
      guides.push({ type: 'horizontal', position: edgesSib.b, length: Math.max(w, s.w) });
    }
    if (Math.abs(edgesMoving.cy - edgesSib.cy) <= SNAP_PX) {
      guides.push({ type: 'horizontal', position: edgesSib.cy, length: Math.max(w, s.w) });
    }

    // Vertical guides
    if (Math.abs(edgesMoving.l - edgesSib.l) <= SNAP_PX) {
      guides.push({ type: 'vertical', position: edgesSib.l, length: Math.max(h, s.h) });
    }
    if (Math.abs(edgesMoving.r - edgesSib.r) <= SNAP_PX) {
      guides.push({ type: 'vertical', position: edgesSib.r, length: Math.max(h, s.h) });
    }
    if (Math.abs(edgesMoving.cx - edgesSib.cx) <= SNAP_PX) {
      guides.push({ type: 'vertical', position: edgesSib.cx, length: Math.max(h, s.h) });
    }
  }

  return guides;
}
