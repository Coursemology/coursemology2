import type { Operation } from 'store';
import type {
  LevelContributionSaveData,
  UpdateWeightsPayload,
} from 'types/course/gradebook';

import CourseAPI from 'api/course';

import { actions } from './store';

const fetchGradebook = (): Operation => async (dispatch) => {
  const response = await CourseAPI.gradebook.index();
  dispatch(actions.saveGradebook(response.data));
};

export const updateGradebookWeights =
  (
    weights: UpdateWeightsPayload['weights'],
    levelContribution?: LevelContributionSaveData,
  ): Operation =>
  async (dispatch) => {
    const response = await CourseAPI.gradebook.updateWeights(
      levelContribution ? { weights, levelContribution } : { weights },
    );
    // BE response does not echo formulaAst; merge it back so the store reducer
    // can optimistically recompute per-student levelContribution without a refetch.
    const responseData = { ...response.data };
    if (levelContribution && responseData.levelContribution) {
      responseData.levelContribution = {
        ...responseData.levelContribution,
        formulaAst: levelContribution.formulaAst,
      };
    }
    dispatch(actions.updateTabWeights(responseData));
  };

export default fetchGradebook;
