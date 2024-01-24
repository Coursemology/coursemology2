export const processCourseUser = (courseUser) => ({
  ...courseUser,
  id: parseInt(courseUser.id, 10),
});

export const processSubmission = (submission) => {
  const totalGrade =
    submission.totalGrade != null
      ? parseFloat(submission.totalGrade)
      : submission.totalGrade;
  const submittedAt =
    submission.submittedAt != null
      ? new Date(submission.submittedAt)
      : submission.submittedAt;
  const endAt =
    submission.endAt != null ? new Date(submission.endAt) : submission.endAt;
  const dayDifference =
    submittedAt != null && endAt != null
      ? Math.floor((submittedAt - endAt) / 86400000)
      : null;

  return {
    ...submission,
    totalGrade,
    submittedAt,
    endAt,
    dayDifference,
    courseUser: processCourseUser(submission.courseUser),
  };
};

export const processAssessment = (assessment) => ({
  ...assessment,
  id: parseInt(assessment.id, 10),
  startAt: new Date(assessment.startAt),
  endAt: assessment.endAt == null ? null : new Date(assessment.endAt),
  maximumGrade: parseFloat(assessment.maximumGrade),
});

export const processAncestor = (ancestor) => ({
  ...ancestor,
  id: parseInt(ancestor.id, 10),
});

function roundToTwoDecimalPoints(num) {
  return Math.round(num * 100) / 100;
}

export const getMean = (numbers) =>
  roundToTwoDecimalPoints(numbers.reduce((a, b) => a + b, 0) / numbers.length);

export const getMedian = (numbers) => {
  if (numbers == null || numbers.length === 0) {
    return 0;
  }
  const sorted = numbers.slice().sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return roundToTwoDecimalPoints((sorted[middle - 1] + sorted[middle]) / 2);
  }

  return roundToTwoDecimalPoints(sorted[middle]);
};

export const getStandardDeviation = (numbers) => {
  if (!numbers || numbers.length === 0) {
    return 0;
  }
  const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
  return roundToTwoDecimalPoints(
    Math.sqrt(
      numbers.map((x) => (x - mean) ** 2).reduce((a, b) => a + b, 0) /
        numbers.length,
    ),
  );
};
