import type { TaskPriority, TaskStatus } from '../types';

export interface BadgeColors {
  bg: string;
  text: string;
}

export const PRIORITY_COLORS: Record<TaskPriority, BadgeColors> = {
  Low: { bg: 'rgba(52,211,153,0.12)', text: '#34D399' },
  Medium: { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24' },
  High: { bg: 'rgba(248,113,113,0.12)', text: '#F87171' },
};

export const STATUS_COLORS: Record<TaskStatus, BadgeColors> = {
  'To Do': { bg: 'rgba(113,113,122,0.15)', text: 'var(--text-secondary)' },
  'In Progress': { bg: 'rgba(99,102,241,0.14)', text: '#818CF8' },
  'Done': { bg: 'rgba(52,211,153,0.12)', text: '#34D399' },
};

export function Badge({ label, colors }: { label?: string; colors?: BadgeColors }) {
  if (!label || !colors) return null;
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 500, background: colors.bg, color: colors.text, marginRight: '8px' }}>
      {label}
    </span>
  );
}

export interface DueDateInfo {
  label: string;
  colors: BadgeColors;
}

// Returns display info for a task's due date, or null if it has none.
export function dueDateInfo(task: { dueDate?: string | null; status?: TaskStatus | string }): DueDateInfo | null {
  if (!task.dueDate) return null;
  const due = new Date(task.dueDate + 'T23:59:59');
  const overdue = due < new Date() && task.status !== 'Done';
  const label = due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  return {
    label: overdue ? `Overdue · ${label}` : `Due ${label}`,
    colors: overdue
      ? { bg: 'rgba(248,113,113,0.12)', text: '#F87171' }
      : { bg: 'rgba(113,113,122,0.15)', text: 'var(--text-secondary)' },
  };
}
