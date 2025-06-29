import { useEffect } from 'react';
import { QuestionType } from 'types/course/assessment/question';

import actionTypes from 'course/assessment/submission/constants';
import { useAppDispatch } from 'lib/hooks/store';

import { AnswerDetailsProps } from '../../types';

import FileContent from './ProgrammingComponent/FileContent';
import TestCases from './ProgrammingComponent/TestCases';

const ProgrammingAnswerDetails = (
  props: AnswerDetailsProps<QuestionType.Programming>,
): JSX.Element => {
  const { answer, displaySettings } = props;
  const annotations = answer.annotations ?? [];

  const {
    showPrivateTestCases,
    showEvaluationTestCases,
    showPublicTestCasesOutput,
    showPrivateTestCasesOutput,
    showEvaluationTestCasesOutput,
    showStdoutAndStderr,
  } = displaySettings;

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
      <TestCases
        showEvaluationTestCases={showEvaluationTestCases}
        showEvaluationTestCasesOutput={showEvaluationTestCasesOutput}
        showPrivateTestCases={showPrivateTestCases}
        showPrivateTestCasesOutput={showPrivateTestCasesOutput}
        showPublicTestCasesOutput={showPublicTestCasesOutput}
        showStdoutAndStderr={showStdoutAndStderr}
        testCase={answer.testCases}
      />
      {/* might not need this component because unpublished annotations (i.e Codaveri) are not shown in Answer Details */}
      {/* students can see this status bar in past attempts view, which is not relevant to them */}
      {/* <CodaveriFeedbackStatus status={answer.codaveriFeedback} /> */}
    </>
  );
};

export default ProgrammingAnswerDetails;
