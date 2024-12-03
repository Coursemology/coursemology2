import { LiveFeedbackChatData } from '../../types';

const getLocalStorageKey = (answerId: string | number): string =>
  `liveFeedbackChat-${answerId}`;

export const getLocalStorageValue = (
  answerId: number,
): LiveFeedbackChatData | null => {
  const key = getLocalStorageKey(answerId);
  const value = localStorage.getItem(key);
  if (!value) return null;

  return JSON.parse(value) as LiveFeedbackChatData;
};

export const setLocalStorageValue = (
  answerId: number,
  storedValue: LiveFeedbackChatData,
): void => {
  const key = getLocalStorageKey(answerId);
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(storedValue));
};

export const modifyLocalStorageValue = (
  answerId: number,
  changes: Partial<LiveFeedbackChatData>,
): void => {
  const value = getLocalStorageValue(answerId);

  const modifiedValue = {
    ...value,
    ...Object.fromEntries(
      Object.entries(changes).filter(([_, v]) => v !== undefined),
    ),
  } as LiveFeedbackChatData;

  setLocalStorageValue(answerId, modifiedValue);
};
