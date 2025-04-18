import { DependencyList, useCallback, useEffect } from 'react';
import debounce, { type DebouncedFunc } from 'lodash-es/debounce';

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
