import { act, renderHook } from '@testing-library/react';

import useDismissibleOnce from '../useDismissibleOnce';

const KEY = 'sample_hint';

beforeEach(() => localStorage.clear());

describe('useDismissibleOnce', () => {
  it('starts not dismissed when nothing is persisted', () => {
    const { result } = renderHook(() => useDismissibleOnce(KEY, 42));
    expect(result.current.dismissed).toBe(false);
  });

  it('dismiss() flips state and persists under the user-namespaced key', () => {
    const { result } = renderHook(() => useDismissibleOnce(KEY, 42));

    act(() => result.current.dismiss());

    expect(result.current.dismissed).toBe(true);
    expect(localStorage.getItem(`42:${KEY}`)).toBe('true');
  });

  it('reads the persisted value on mount', () => {
    localStorage.setItem(`42:${KEY}`, 'true');
    const { result } = renderHook(() => useDismissibleOnce(KEY, 42));
    expect(result.current.dismissed).toBe(true);
  });

  it('isolates dismissal per user (one user dismissing does not affect another)', () => {
    localStorage.setItem(`42:${KEY}`, 'true');

    const userB = renderHook(() => useDismissibleOnce(KEY, 99));

    expect(userB.result.current.dismissed).toBe(false);
  });

  it('is a safe no-op when userId is absent', () => {
    const { result } = renderHook(() => useDismissibleOnce(KEY, undefined));

    expect(result.current.dismissed).toBe(false);
    act(() => result.current.dismiss());
    expect(result.current.dismissed).toBe(true);
    // Nothing written without a real user id.
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it('does not throw if persistence fails (quota/security error)', () => {
    const spy = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new DOMException('QuotaExceededError');
      });

    const { result } = renderHook(() => useDismissibleOnce(KEY, 42));

    expect(() => act(() => result.current.dismiss())).not.toThrow();
    expect(result.current.dismissed).toBe(true);

    spy.mockRestore();
  });
});
