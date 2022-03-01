import { sortByGroupRole, sortByName } from './sort';

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

export function getSummaryOfModifications(groups, modifiedGroups) {
  const modifiedGroupSummaries = [];
  const groupMap = new Map();
  groups.forEach((g) => groupMap.set(g.id, g));

  modifiedGroups.forEach((group) => {
    const groupData = {
      id: group.id,
      name: group.name,
      added: [],
      removed: [],
      updated: [],
    };
    const originalGroup = groupMap.get(group.id);
    if (!originalGroup) return; // Should not happen, but just in case
    const memberMap = new Map();
    originalGroup.members.forEach((m) => {
      memberMap.set(m.id, m);
    });
    group.members.forEach((m) => {
      if (!memberMap.has(m.id)) {
        groupData.added.push(m);
        return;
      }
      const originalMember = memberMap.get(m.id);
      if (m.groupRole !== originalMember.groupRole) {
        groupData.updated.push(m);
      }
    });
    const newMemberIds = new Set(group.members.map((m) => m.id));
    originalGroup.members.forEach((m) => {
      if (!newMemberIds.has(m.id)) {
        groupData.removed.push(m);
      }
    });

    groupData.added.sort(sortByName).sort(sortByGroupRole);
    groupData.removed.sort(sortByName).sort(sortByGroupRole);
    groupData.updated.sort(sortByName).sort(sortByGroupRole);

    if (
      groupData.added.length > 0 ||
      groupData.removed.length > 0 ||
      groupData.updated.length > 0
    ) {
      modifiedGroupSummaries.push(groupData);
    }
  });

  modifiedGroupSummaries.sort(sortByName);
  return modifiedGroupSummaries;
}
