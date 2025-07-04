import { useEffect } from 'react';
import { Alert } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';

import actionTypes from 'course/assessment/submission/constants';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import { AnswerDetailsProps } from '../../types';

import CodaveriFeedbackStatus from './ProgrammingComponent/CodaveriFeedbackStatus';
import FileContent from './ProgrammingComponent/FileContent';
import TestCases from './ProgrammingComponent/TestCases';

const ProgrammingAnswerDetails = (
  props: AnswerDetailsProps<QuestionType.Programming>,
): JSX.Element => {
  const { answer } = props;
  const annotations = answer.annotations ?? [];

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  useEffect(() => {
    dispatch({
      type: actionTypes.FETCH_ANNOTATION_SUCCESS,
      payload: { posts: answer.posts },
    });
  }, [dispatch]);

  return (
    <>
      {answer.gradedOnPastSnapshot && (
        <Alert severity="warning">
          {t(translations.answerGradedOnPastSnapshot)}
        </Alert>
      )}
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
