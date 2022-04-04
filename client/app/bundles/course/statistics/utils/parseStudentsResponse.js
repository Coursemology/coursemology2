// eslint-disable-next-line import/prefer-default-export
export const processStudent = (student) => ({
  ...student,
  level: parseInt(student.level ?? 0, 10),
  experiencePoints: parseInt(student.experiencePoints ?? 0, 10),
  ...Object.keys(student.assessments ?? {}).reduce((acc, key) => {
    acc[parseInt(key, 10)] =
      Math.round(parseFloat(student.assessments[key]) * 10000) / 100;
    return acc;
  }, {}),
  numAssessmentsCompleted: Object.keys(student.assessments ?? {}).length,
});
