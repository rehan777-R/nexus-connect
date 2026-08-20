import type { TaskPriority, TaskStatus } from '../types';

export interface BadgeColors {
  bg: string;
  text: string;
}

export const PRIORITY_COLORS: Record<TaskPriority, BadgeColors> = {
  Low: { bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
  Medium: { bg: 'rgba(234,179,8,0.12)', text: '#EAB308' },
  High: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' },
};

export const STATUS_COLORS: Record<TaskStatus, BadgeColors> = {
  'To Do': { bg: 'rgba(113,113,122,0.15)', text: '#A1A1AA' },
  'In Progress': { bg: 'rgba(37,99,235,0.12)', text: '#3B82F6' },
  'Done': { bg: 'rgba(34,197,94,0.12)', text: '#22C55E' },
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
      ? { bg: 'rgba(239,68,68,0.12)', text: '#EF4444' }
      : { bg: 'rgba(113,113,122,0.15)', text: '#A1A1AA' },
  };
}
