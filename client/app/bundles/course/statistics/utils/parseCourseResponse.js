export const processAssessment = (assessment) => ({
  ...assessment,
  id: parseInt(assessment.id, 10),
  startAt: new Date(assessment.startAt),
  endAt: assessment.endAt ? new Date(assessment.endAt) : assessment.endAt,
});

export const processSubmissions = (submission) => ({
  ...submission,
  id: parseInt(submission.id, 10),
  submissions: submission.submissions.map((s) => ({
    assessmentId: parseInt(s.assessmentId, 10),
    submittedAt: new Date(s.submittedAt),
  })),
});

export const processStudentPerformance = (student) => ({
  ...student,
  id: parseInt(student.id, 10),
  numSubmissions:
    student.numSubmissions != null ? parseInt(student.numSubmissions, 10) : 0,
  correctness:
    student.correctness != null
      ? Math.round(10000 * parseFloat(student.correctness)) / 100
      : null,
  learningRate:
    student.learningRate != null
      ? // We do division here since lower learning rate = better
        Math.round(10000 / parseFloat(student.learningRate)) / 100
      : null,
  achievementCount: parseInt(student.achievementCount ?? 0, 10),
  level: parseInt(student.level ?? 0, 10),
  experiencePoints: parseInt(student.experiencePoints ?? 0, 10),
  videoSubmissionCount: parseInt(student.videoSubmissionCount ?? 0, 10),
  videoPercentWatched: parseFloat(student.videoPercentWatched ?? 0),
});
