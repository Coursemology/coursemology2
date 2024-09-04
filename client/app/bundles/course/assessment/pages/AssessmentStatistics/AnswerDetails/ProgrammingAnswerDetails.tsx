import { useEffect } from 'react';
import { Annotation } from 'types/course/statistics/answer';
import { QuestionAnswerDisplayDetails } from 'types/course/statistics/assessmentStatistics';

import actionTypes from 'course/assessment/submission/constants';
import { useAppDispatch } from 'lib/hooks/store';

import CodaveriFeedbackStatus from './ProgrammingComponent/CodaveriFeedbackStatus';
import FileContent from './ProgrammingComponent/FileContent';
import TestCases from './ProgrammingComponent/TestCases';

const ProgrammingAnswerDetails = (
  props: QuestionAnswerDisplayDetails<'Programming'>,
): JSX.Element => {
  const { answer } = props;
  const annotations = answer.annotations ?? ([] as Annotation[]);

  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch({
      type: actionTypes.FETCH_ANNOTATION_SUCCESS,
      payload: { posts: answer.posts },
    });
  });

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
      <TestCases testCase={answer.testCases} />
      <CodaveriFeedbackStatus status={answer.codaveriFeedback} />
    </>
  );
};

export default ProgrammingAnswerDetails;
