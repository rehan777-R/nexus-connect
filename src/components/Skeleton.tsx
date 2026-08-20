import type { CSSProperties } from 'react';

// Shimmering placeholder shown while Firestore data loads.
export function Skeleton({ height = 16, width = '100%', style }: { height?: number | string; width?: number | string; style?: CSSProperties }) {
  return <div className="skeleton" aria-hidden="true" style={{ height, width, ...style }} />;
}

// A card-shaped skeleton matching the task list rows.
export function SkeletonCard() {
  return (
    <div style={{ background: 'var(--surface)', borderRadius: '12px', padding: '20px 24px', marginBottom: '14px', border: '1px solid var(--border)' }}>
      <Skeleton height={12} width={140} style={{ marginBottom: '12px' }} />
      <Skeleton height={16} width="55%" style={{ marginBottom: '10px' }} />
      <Skeleton height={12} width="80%" />
    </div>
  );
}
