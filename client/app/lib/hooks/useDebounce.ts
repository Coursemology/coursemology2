import { DependencyList, useCallback, useEffect } from 'react';
import type { DebouncedFunc } from 'lodash';
import { debounce } from 'lodash';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
  deps: DependencyList,
): DebouncedFunc<T> => {
  const debouncedCallback = useCallback(debounce(callback, delay), [
    delay,
    ...deps,
  ]);
  useEffect(() => {
    // To cancel any debounced functions when a page is unmounted
    return () => debouncedCallback.cancel();
  }, [debouncedCallback, delay, ...deps]);
  return debouncedCallback;
};
