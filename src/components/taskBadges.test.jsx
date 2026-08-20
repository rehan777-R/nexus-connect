import { render, screen } from '@testing-library/react';
import { Badge, dueDateInfo, PRIORITY_COLORS } from './taskBadges';

function isoDaysFromNow(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

describe('Badge', () => {
  it('renders the label with the given colors', () => {
    render(<Badge label="High" colors={PRIORITY_COLORS.High} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('renders nothing when label or colors are missing', () => {
    const { container: noLabel } = render(<Badge colors={PRIORITY_COLORS.High} />);
    expect(noLabel).toBeEmptyDOMElement();
    const { container: noColors } = render(<Badge label="High" />);
    expect(noColors).toBeEmptyDOMElement();
  });
});

describe('dueDateInfo', () => {
  it('returns null for a task without a due date', () => {
    expect(dueDateInfo({ title: 'x' })).toBeNull();
    expect(dueDateInfo({ dueDate: '' })).toBeNull();
  });

  it('labels a future due date as "Due"', () => {
    const info = dueDateInfo({ dueDate: isoDaysFromNow(3), status: 'To Do' });
    expect(info.label).toMatch(/^Due /);
  });

  it('labels a past due date on an unfinished task as overdue', () => {
    const info = dueDateInfo({ dueDate: isoDaysFromNow(-2), status: 'In Progress' });
    expect(info.label).toMatch(/^Overdue/);
  });

  it('does not mark a completed task as overdue', () => {
    const info = dueDateInfo({ dueDate: isoDaysFromNow(-2), status: 'Done' });
    expect(info.label).toMatch(/^Due /);
  });

  it('treats a task due today as not overdue until end of day', () => {
    const info = dueDateInfo({ dueDate: isoDaysFromNow(0), status: 'To Do' });
    expect(info.label).toMatch(/^Due /);
  });
});
