import { useMatches } from 'react-router-dom';

export type Promisable<T> = T | Promise<T>;

export type Match = ReturnType<typeof useMatches>[number];

export const isRecord = <K extends string | number | symbol, V>(
  value: unknown,
): value is Record<K, V> => typeof value === 'object' && value !== null;

export const isPromise = <T>(value: unknown): value is Promise<T> =>
  isRecord(value) && 'then' in value && typeof value.then === 'function';
