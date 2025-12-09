import { workflowStates } from 'course/survey/constants';

const processAnswer = (answer) => ({
  ...answer,
  grade: parseFloat(answer.grade),
  maximumGrade: parseFloat(answer.maximumGrade),
});

export const processSubmission = (submission) => {
  const totalGrade =
    submission.totalGrade != null ? parseFloat(submission.totalGrade) : null;
  const maximumGrade =
    submission.maximumGrade != null
      ? parseFloat(submission.maximumGrade)
      : null;
  const answers =
    submission.answers != null ? submission.answers.map(processAnswer) : null;
  const submittedAt =
    submission.submittedAt != null ? new Date(submission.submittedAt) : null;
  const endAt = submission.endAt != null ? new Date(submission.endAt) : null;
  const dayDifference =
    submittedAt != null && endAt != null
      ? Math.floor((submittedAt - endAt) / 86400000)
      : null;

  return {
    ...submission,
    answers,
    totalGrade,
    maximumGrade,
    submittedAt,
    endAt,
    dayDifference,
  };
};

const WorkflowStatesValueMapper = {
  [workflowStates.Unstarted]: 0,
  attempting: 1,
  submitted: 2,
  graded: 3,
  published: 4,
};

export const sortSubmissionsByWorkflowState = (submissionA, submissionB) =>
  WorkflowStatesValueMapper[
    submissionA.workflowState ?? workflowStates.Unstarted
  ] -
  WorkflowStatesValueMapper[
    submissionB.workflowState ?? workflowStates.Unstarted
  ];

function processDayDifference(dayDifference) {
  if (dayDifference < 0) {
    return `D${dayDifference}`;
  }
  if (dayDifference === 0) {
    return 'D';
  }
  return `D+${dayDifference}`;
}

export function processSubmissionsIntoChartData(submissions) {
  const submittedSubmissions = submissions.filter((s) => s.submittedAt != null);
  const mappedSubmissions = submittedSubmissions
    .map((s) => ({
      ...s,
      displayValue:
        s.dayDifference != null
          ? processDayDifference(s.dayDifference)
          : `${new Date(s.submittedAt).getFullYear()}-${new Date(
              s.submittedAt,
            ).getMonth()}-${new Date(s.submittedAt).getDate()}`,
    }))
    .sort((a, b) => {
      if (a.dayDifference != null) {
        return a.dayDifference - b.dayDifference;
      }
      return a.submittedAt - b.submittedAt;
    });
  const labels = [...new Set(mappedSubmissions.map((s) => s.displayValue))];
  const lineData = [];
  const barData = [];

  let totalGrade = 0;
  let numGrades = 0;
  let numSubmissions = 0;

  let previousDisplayValue;
  mappedSubmissions.forEach((sub) => {
    if (
      sub.displayValue !== previousDisplayValue &&
      previousDisplayValue != null
    ) {
      lineData.push(totalGrade / numGrades);
      barData.push(numSubmissions);
    }
    if (sub.displayValue !== previousDisplayValue) {
      totalGrade = 0;
      numGrades = 0;
      numSubmissions = 0;
      previousDisplayValue = sub.displayValue;
    }
    numSubmissions += 1;
    if (sub.totalGrade != null) {
      totalGrade += sub.totalGrade;
      numGrades += 1;
    }
  });
  if (numSubmissions > 0) {
    lineData.push(totalGrade / numGrades);
    barData.push(numSubmissions);
  }
  return { labels, lineData, barData };
}

// Change to this function when file is converted to TypeScript
// const getJointGroupsName = (groups: {name: string}[]): string =>
//   groups
//     ? groups
//         .map((group) => group.name)
//         .sort()
//         .join(', ')
//     : '';

export const getJointGroupsName = (groups) =>
  groups
    ? groups
        .map((group) => group.name)
        .sort()
        .join(', ')
    : '';
