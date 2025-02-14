import { LiveFeedbackLocalStorage } from '../../types';

const getLocalStorageKey = (answerId: string | number): string =>
  `liveFeedbackChat-${answerId}`;

export const getLocalStorageValue = (
  answerId: number,
): LiveFeedbackLocalStorage | null => {
  const key = getLocalStorageKey(answerId);
  const value = localStorage.getItem(key);
  if (!value) return null;

  return JSON.parse(value) as LiveFeedbackLocalStorage;
};

export const setLocalStorageValue = (
  answerId: number,
  storedValue: LiveFeedbackLocalStorage,
): void => {
  const key = getLocalStorageKey(answerId);
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(storedValue));
};

export const modifyLocalStorageValue = (
  answerId: number,
  changes: Partial<LiveFeedbackLocalStorage>,
): void => {
  const value = getLocalStorageValue(answerId);

  const modifiedValue = {
    ...value,
    ...Object.fromEntries(
      Object.entries(changes).filter(([_, v]) => v !== undefined),
    ),
  } as LiveFeedbackLocalStorage;

  setLocalStorageValue(answerId, modifiedValue);
};
