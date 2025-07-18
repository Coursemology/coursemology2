import { useEffect } from 'react';
import { QuestionType } from 'types/course/assessment/question';

import actionTypes from 'course/assessment/submission/constants';
import { useAppDispatch } from 'lib/hooks/store';

import { AnswerDetailsProps } from '../../types';

import AutoGradingComponent from './ProgrammingComponent/AutoGradingComponent';
import CodaveriFeedbackStatus from './ProgrammingComponent/CodaveriFeedbackStatus';
import FileContent from './ProgrammingComponent/FileContent';

const ProgrammingAnswerDetails = (
  props: AnswerDetailsProps<QuestionType.Programming>,
): JSX.Element => {
  const { answer } = props;
  const annotations = answer.annotations ?? [];

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch({
      type: actionTypes.FETCH_ANNOTATION_SUCCESS,
      payload: { posts: answer.posts },
    });
  }, [dispatch]);

  return (
    <>
      {answer.fields.files_attributes.map((file) => (
        <FileContent
          key={`file-${file.id}-answer-${answer.id}`}
          annotations={annotations}
          answerId={answer.id}
          file={file}
        />
      ))}
      {answer.autogradings && answer.autogradings.length > 0 && (
        <AutoGradingComponent autogradings={answer.autogradings} />
      )}
      <CodaveriFeedbackStatus status={answer.codaveriFeedback} />
    </>
  );
};

export default ProgrammingAnswerDetails;
