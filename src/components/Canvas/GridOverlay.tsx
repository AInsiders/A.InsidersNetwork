import React from 'react';

interface GridOverlayProps {
  show?: boolean;
}

export function GridOverlay({ show = true }: GridOverlayProps) {
  if (!show) return null;

  return (
    <div className="absolute inset-0 grid-overlay pointer-events-none z-0" />
  );
}
