import React from 'react';

interface Guide {
  type: 'horizontal' | 'vertical';
  position: number;
  length: number;
}

interface GuidesProps {
  guides: Guide[];
}

export function Guides({ guides }: GuidesProps) {
  if (guides.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {guides.map((guide, index) => (
        <div
          key={index}
          className={`snap-guide ${guide.type}`}
          style={{
            [guide.type === 'horizontal' ? 'top' : 'left']: `${guide.position}px`,
            [guide.type === 'horizontal' ? 'width' : 'height']: `${guide.length}px`,
          }}
        />
      ))}
    </div>
  );
}
