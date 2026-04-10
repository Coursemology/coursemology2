import { Operation } from 'store';

import CourseAPI from 'api/course';

import { scribingActions } from '../../reducers/scribing';

export function updateScribingAnswer(
  answerId: number,
  answerActableId: number,
  scribblesInJSON: string,
): Operation {
  const data = {
    content: scribblesInJSON,
    answer_id: answerActableId,
  };

  return async (dispatch) => {
    dispatch(scribingActions.updateScribingAnswerRequest({ answerId }));

    return CourseAPI.assessment.answer.scribing
      .update(answerId, data)
      .then(() => {
        dispatch(scribingActions.updateScribingAnswerSuccess({ answerId }));
      })
      .catch(() => {
        dispatch(scribingActions.updateScribingAnswerFailure({ answerId }));
      });
  };
}
