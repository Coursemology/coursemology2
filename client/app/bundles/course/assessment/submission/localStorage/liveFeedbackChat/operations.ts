import { LiveFeedbackChatData } from '../../types';

const getLocalStorageKey = (
  questionId: string | number,
  submissionId: string | null,
): string | null =>
  submissionId ? `liveFeedbackChat-${submissionId}-${questionId}` : null;

export const getLocalStorageValue = (
  questionId: string | number,
  submissionId: string | null,
): LiveFeedbackChatData | null => {
  const key = getLocalStorageKey(questionId, submissionId);
  if (!key) return null;

  const value = localStorage.getItem(key);
  if (!value) return null;

  return JSON.parse(value) as LiveFeedbackChatData;
};

export const setLocalStorageValue = (
  questionId: string | number,
  storedValue: LiveFeedbackChatData,
  submissionId: string | null,
): void => {
  const key = getLocalStorageKey(questionId, submissionId);
  if (!key) return;

  localStorage.setItem(key, JSON.stringify(storedValue));
};

export const modifyLocalStorageValue = (
  questionId: string | number,
  changes: Partial<LiveFeedbackChatData>,
  submissionId: string | null,
): void => {
  const value = getLocalStorageValue(questionId, submissionId);
  if (!value) return;

  const modifiedValue = {
    ...value,
    ...Object.fromEntries(
      Object.entries(changes).filter(([_, v]) => v !== undefined),
    ),
  };

  setLocalStorageValue(questionId, modifiedValue, submissionId);
};
