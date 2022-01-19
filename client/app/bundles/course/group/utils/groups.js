import { sortByName } from './sort';

export function combineGroups(groups, modifiedGroups) {
  const combined = [...modifiedGroups];
  const modifiedIds = new Set(modifiedGroups.map((g) => g.id));
  groups.forEach((g) => {
    if (!modifiedIds.has(g.id)) {
      combined.push(g);
    }
  });
  combined.sort(sortByName);
  return combined;
}

export function getFinalModifiedGroups(groups, modifiedGroups) {
  const finalModifiedGroups = [];
  const groupMap = new Map();
  groups.forEach((g) => groupMap.set(g.id, g));
  modifiedGroups.forEach((g) => {
    const originalGroup = groupMap.get(g.id);
    if (g.members.length !== originalGroup.members.length) {
      finalModifiedGroups.push(g);
      return;
    }
    const memberMap = new Map();
    originalGroup.members.forEach((m) => memberMap.set(m.id, m));
    let shouldPush = false;
    g.members.forEach((m) => {
      const originalMember = memberMap.get(m.id);
      if (!originalMember) {
        shouldPush = true;
        return;
      }
      if (originalMember.groupRole !== m.groupRole) {
        shouldPush = true;
      }
    });
    if (shouldPush) {
      finalModifiedGroups.push(g);
    }
  });
  return finalModifiedGroups;
}
