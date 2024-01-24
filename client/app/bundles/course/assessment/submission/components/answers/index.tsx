// eslint-disable-next-line simple-import-sort/imports
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Divider, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { QuestionType } from 'types/course/assessment/question';
import { saveAnswer, updateClientVersion } from '../../actions/answers';
import { uploadTextResponseFiles } from '../../actions/answers/textResponse';

import Answer from './Answer';
import AnswerHeader from './AnswerHeader';
import { AnswerPropsMap } from './types';
import { QuestionHistory } from '../../reducers/history/types';
import { updateAnswerFlagSavingStatus } from '../../reducers/answerFlags';

interface SubmissionAnswerProps<T extends keyof typeof QuestionType> {
  answerId: number;
  graderView: boolean;
  historyQuestions: Record<number, QuestionHistory>;
  question: SubmissionQuestionData<T>;
  questionType: T;
  readOnly: boolean;
  showMcqMrqSolution: boolean;
}

const SubmissionAnswer = <T extends keyof typeof QuestionType>(
  props: SubmissionAnswerProps<T>,
): JSX.Element => {
  const {
    answerId,
    graderView,
    historyQuestions,
    question,
    questionType,
    readOnly,
    showMcqMrqSolution,
  } = props;
  const dispatch = useAppDispatch();

  const { getValues, resetField } = useFormContext();

  const handleSaveAnswer = (
    answerData: unknown,
    savedAnswerId: number,
    currentTime: number,
  ): void => {
    dispatch(saveAnswer(answerData, savedAnswerId, currentTime, resetField));
  };

  const debouncedSaveAnswer = useDebounce(
    handleSaveAnswer,
    questionType === 'VoiceResponse' ? 0 : FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const saveAnswerAndUpdateClientVersion = (saveAnswerId: number): void => {
    const answer = getValues()[saveAnswerId];
    const currentTime = Date.now();
    dispatch(updateClientVersion(saveAnswerId, currentTime));
    dispatch(
      updateAnswerFlagSavingStatus({
        answer: { id: saveAnswerId },
        savingStatus: 'None',
      }),
    );
    debouncedSaveAnswer(answer, saveAnswerId, currentTime);
  };

  const handleUploadTextResponseFiles = (savedAnswerId: number): void => {
    const answer = getValues()[savedAnswerId];

    dispatch(uploadTextResponseFiles(savedAnswerId, answer, resetField));
  };

  const answerPropsMap: AnswerPropsMap = {
    MultipleChoice: {
      answerId,
      question: question as SubmissionQuestionData<'MultipleChoice'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    MultipleResponse: {
      answerId,
      question: question as SubmissionQuestionData<'MultipleResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    Programming: {
      answerId,
      question: question as SubmissionQuestionData<'Programming'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
    TextResponse: {
      answerId,
      question: question as SubmissionQuestionData<'TextResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      handleUploadTextResponseFiles,
    },
    FileUpload: {
      answerId,
      question: question as SubmissionQuestionData<'FileUpload'>,
      readOnly,
      graderView,
      handleUploadTextResponseFiles,
    },
    Comprehension: {},
    VoiceResponse: {
      answerId,
      question: question as SubmissionQuestionData<'VoiceResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
    ForumPostResponse: {
      answerId,
      question: question as SubmissionQuestionData<'ForumPostResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
    Scribing: {
      answerId,
      question: question as SubmissionQuestionData<'Scribing'>,
    },
  };

  return (
    <>
      <AnswerHeader
        answerId={answerId}
        historyQuestions={historyQuestions}
        question={question}
      />

      <Divider />

      <Typography className="mt-2" variant="body1">
        {question.questionTitle}
      </Typography>

      <Typography
        dangerouslySetInnerHTML={{ __html: question.description }}
        variant="body2"
      />

      <Divider />

      <Answer
        answerId={answerId}
        answerProps={answerPropsMap[questionType]}
        question={question}
        questionType={questionType}
      />
    </>
  );
};

export default memo(SubmissionAnswer, equal);
