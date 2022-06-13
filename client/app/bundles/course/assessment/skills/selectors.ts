/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { AppState } from 'types/store';
import { selectMiniEntities } from 'utilities/store';

function getLocalState(state: AppState) {
  return state.skills;
}

export function getSkillBranches(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).skillBranches,
    getLocalState(state).skillBranches.ids,
  );
}

export function getSkills(state: AppState) {
  return selectMiniEntities(
    getLocalState(state).skills,
    getLocalState(state).skills.ids,
  );
}

export function getSkillSettings(state: AppState) {
  return getLocalState(state).skillSettings;
}
