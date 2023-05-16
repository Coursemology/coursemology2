/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.skills;
}

export function getAllSkillBranchMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).skillBranches,
    getLocalState(state).skillBranches.ids,
  );
}

export function getAllSkillMiniEntities(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).skills,
    getLocalState(state).skills.ids,
  );
}

export function getSkillPermissions(state: AppState) {
  return getLocalState(state).permissions;
}
