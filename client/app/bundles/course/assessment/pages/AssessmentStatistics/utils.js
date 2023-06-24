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
          : `${s.submittedAt.getFullYear()}-${s.submittedAt.getMonth()}-${s.submittedAt.getDate()}`,
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
    if (sub.grade != null) {
      totalGrade += sub.grade;
      numGrades += 1;
    }
  });
  if (numSubmissions > 0) {
    lineData.push(totalGrade / numGrades);
    barData.push(numSubmissions);
  }
  return { labels, lineData, barData };
}
