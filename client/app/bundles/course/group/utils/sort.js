export function sortByName(a, b) {
  return a.name.localeCompare(b.name);
}

export function sortByGroupRole(a, b) {
  return a.groupRole.localeCompare(b.groupRole);
}

export function sortByPhantom(a, b) {
  return a.isPhantom - b.isPhantom;
}

export function sortByCourseTitleAndTitle(a, b) {
  const courseTitleComparison = a.courseTitle.localeCompare(b.courseTitle);
  if (courseTitleComparison !== 0) {
    return courseTitleComparison;
  }
  return a.title.localeCompare(b.title);
}
