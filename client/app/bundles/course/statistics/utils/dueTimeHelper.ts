import {
  ALMOST_DUE_THRESHOLD,
  dueInStates,
} from 'course/assessment/submission/constants';

import { CourseAssessmentTime } from '../types';

export const fetchDueInTimeAndStates = (
  rawTime: number | null,
): {
  dueStates: string;
  formattedTime: string;
} | null => {
  if (!rawTime) {
    return null;
  }

  const absoluteRawTime = Math.abs(rawTime);

  const seconds = absoluteRawTime % 60;
  const minutes = Math.floor(absoluteRawTime / 60) % 60;
  const hours = Math.floor(absoluteRawTime / (60 * 60)) % 24;
  const days = Math.floor(absoluteRawTime / (60 * 60 * 24));

  let formattedTime = '';

  if (days > 0) {
    formattedTime = `${days} ${days > 1 ? 'days' : 'day'}`;
  } else if (hours > 0) {
    formattedTime = `${hours} ${hours > 1 ? 'hours' : 'hour'}`;
  } else if (minutes > 0) {
    formattedTime = `${minutes} ${minutes > 1 ? 'mins' : 'min'}`;
  } else {
    formattedTime = `${seconds} ${seconds > 1 ? 'secs' : 'sec'}`;
  }

  let dueStates = '';

  if (rawTime >= ALMOST_DUE_THRESHOLD) {
    dueStates = dueInStates.NotDue;
  } else {
    dueStates = rawTime >= 0 ? dueInStates.AlmostDue : dueInStates.OverDue;
  }

  return {
    dueStates,
    formattedTime: rawTime < 0 ? `${formattedTime} ago` : formattedTime,
  };
};

export const sortByDueIn = (
  a1: CourseAssessmentTime,
  a2: CourseAssessmentTime,
): number => {
  return a2.dueIn! - a1.dueIn!;
};
