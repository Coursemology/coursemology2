import { defineMessages } from 'react-intl';

const translations = defineMessages({
  startAt: {
    id: 'course.statistics.course.studentProgressionChart.startAt',
    defaultMessage: 'Starts at: {startAt}',
  },
  endAt: {
    id: 'course.statistics.course.studentProgressionChart.endAt',
    defaultMessage: 'Deadline: {endAt}',
  },
  clickToView: {
    id: 'course.statistics.course.studentProgressionChart.clickToView',
    defaultMessage: "Click to view {name}'s submissions",
  },
});

export function processSubmissionsIntoChartData(
  assessments,
  submissions,
  showPhantoms,
) {
  // We want to form a smooth Deadlines curve.
  assessments.sort((a, b) => a.endAt - b.endAt);

  // For O(1) lookup of assessment array index later on.
  const assessmentIdToIndexMap = new Map(
    assessments.map((a, id) => [a.id, id]),
  );

  const studentData = submissions
    .filter((s) => (showPhantoms ? true : !s.isPhantom))
    .map((s) => {
      const orderedSubmissions = s.submissions
        .map((s2) => ({
          ...s2,
          key: assessmentIdToIndexMap.get(s2.assessmentId),
        }))
        .sort((a, b) => a.key - b.key);
      const indexToSubmissionMap = new Map(
        orderedSubmissions.map((s3) => [s3.key, s3]),
      );

      const total = orderedSubmissions.length;
      const result = [];
      let added = 0;
      // Populate null values for assessments with no submissions.
      // We do so until the last submission is reached, i.e. we don't
      // populate beyond that until the end. This is so that the last
      // submission can be identified without having to re-trim null values.
      for (let i = 0; i < assessments.length; i += 1) {
        if (added === total) {
          break;
        }
        if (indexToSubmissionMap.has(i)) {
          added += 1;
          result.push(indexToSubmissionMap.get(i));
        } else {
          result.push(null);
        }
      }
      return { ...s, submissions: result };
    });

  return studentData.filter((s) => s.submissions.length > 0);
}

export const computeLimits = (assessments, submissions) => {
  if (assessments == null || assessments.length === 0) {
    return {};
  }
  const endAts = assessments.map((a) => a.endAt);
  const minEndAt = new Date(Math.min(...endAts));
  const maxEndAt = new Date(Math.max(...endAts));

  if (submissions == null || submissions.length === 0) {
    return { min: minEndAt, max: maxEndAt };
  }
  const submittedAts = submissions
    .flatMap((s) => s.submissions)
    .map((s) => s.submittedAt);
  if (submittedAts.length === 0) {
    return { min: minEndAt, max: maxEndAt };
  }
  const minSubmittedAt = new Date(Math.min(...submittedAts));
  const maxSubmittedAt = new Date(Math.max(...submittedAts));
  return {
    min: minEndAt < minSubmittedAt ? minEndAt : minSubmittedAt,
    max: maxEndAt > maxSubmittedAt ? maxEndAt : maxSubmittedAt,
  };
};

export const titleRenderer = (items) =>
  `${items[0].raw.title} (${items.length})`;

export const labelRenderer = (t) => (item) => {
  if (item.raw.name) {
    return `${item.raw.name}: ${item.label}`;
  }
  if (item.raw.isStartAt) {
    return t(translations.startAt, { startAt: item.label });
  }
  return t(translations.endAt, { endAt: item.label });
};

export const footerRenderer = (t) => (items) => {
  if (items.length === 1 && items[0].raw.name) {
    return t(translations.clickToView, {
      name: items[0].raw.name,
    });
  }
  return undefined;
};
