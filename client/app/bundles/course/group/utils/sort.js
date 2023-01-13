export function sortByName(a, b) {
  return a.name.localeCompare(b.name);
}

export function sortByGroupRole(a, b) {
  return a.groupRole.localeCompare(b.groupRole);
}

export function sortByPhantom(a, b) {
  return a.isPhantom - b.isPhantom;
}
