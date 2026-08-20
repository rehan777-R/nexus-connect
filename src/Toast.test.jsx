import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from './Toast';

function Trigger({ type }) {
  const showToast = useToast();
  return <button onClick={() => showToast('Saved!', type)}>notify</button>;
}

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe('Toast', () => {
  it('shows a toast when triggered and hides it after the timeout', () => {
    render(
      <ToastProvider>
        <Trigger type="success" />
      </ToastProvider>
    );

    act(() => screen.getByRole('button', { name: 'notify' }).click());
    expect(screen.getByText('Saved!')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(4000));
    expect(screen.queryByText('Saved!')).not.toBeInTheDocument();
  });

  it('can stack multiple toasts', () => {
    render(
      <ToastProvider>
        <Trigger type="error" />
      </ToastProvider>
    );
    const button = screen.getByRole('button', { name: 'notify' });
    act(() => { button.click(); button.click(); });
    expect(screen.getAllByText('Saved!')).toHaveLength(2);
  });
});
