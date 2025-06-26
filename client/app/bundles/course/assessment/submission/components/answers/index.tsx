// eslint-disable-next-line simple-import-sort/imports
import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
import { Divider, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import {
  FIELD_LONG_DEBOUNCE_DELAY_MS,
  ANSWER_TOO_LARGE_ERR,
} from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import { QuestionType } from 'types/course/assessment/question';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';
import { saveAnswer, updateClientVersion } from '../../actions/answers';
import { uploadTextResponseFiles } from '../../actions/answers/textResponse';

import Answer from './Answer';
import AnswerHeader from './AnswerHeader';
import { AnswerPropsMap } from './types';
import { updateAnswerFlagSavingStatus } from '../../reducers/answerFlags';
import useErrorTranslation from '../../pages/SubmissionEditIndex/useErrorTranslation';
import { ErrorType } from '../../pages/SubmissionEditIndex/validations/types';
import translations from '../../translations';

interface SubmissionAnswerProps<T extends keyof typeof QuestionType> {
  answerId: number | null;
  graderView: boolean;
  published: boolean;
  allErrors: ErrorType[];
  question: SubmissionQuestionData<T>;
  questionType: T;
  readOnly: boolean;
  showMcqMrqSolution: boolean;
  openAnswerHistoryView: (questionId: number, questionNumber: number) => void;
  questionNumber: number;
}

const DebounceDelayMap = {
  MultipleChoice: FIELD_LONG_DEBOUNCE_DELAY_MS,
  MultipleResponse: FIELD_LONG_DEBOUNCE_DELAY_MS,
  Programming: FIELD_LONG_DEBOUNCE_DELAY_MS,
  TextResponse: FIELD_LONG_DEBOUNCE_DELAY_MS,
  FileUpload: 0,
  Comprehension: FIELD_LONG_DEBOUNCE_DELAY_MS,
  VoiceResponse: 0,
  ForumPostResponse: FIELD_LONG_DEBOUNCE_DELAY_MS,
  Scribing: 0,
  RubricBasedResponse: FIELD_LONG_DEBOUNCE_DELAY_MS,
};

const SubmissionAnswer = <T extends keyof typeof QuestionType>(
  props: SubmissionAnswerProps<T>,
): JSX.Element => {
  const {
    answerId,
    allErrors,
    graderView,
    published,
    question,
    questionType,
    readOnly,
    showMcqMrqSolution,
    openAnswerHistoryView,
    questionNumber,
  } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { getValues, resetField } = useFormContext();
  const errorMessages = useErrorTranslation(allErrors);

  const handleSaveAnswer = (
    answerData: unknown,
    savedAnswerId: number,
    currentTime: number,
  ): void => {
    dispatch(
      saveAnswer(answerData, savedAnswerId, currentTime, resetField),
    ).catch((error) => {
      if (error?.message?.includes(ANSWER_TOO_LARGE_ERR)) {
        toast.error(t(translations.answerTooLargeError));
      }
    });
  };

  const debouncedSaveAnswer = useDebounce(
    handleSaveAnswer,
    DebounceDelayMap[questionType],
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
      published,
    },
    MultipleResponse: {
      answerId,
      question: question as SubmissionQuestionData<'MultipleResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
      published,
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
    RubricBasedResponse: {
      answerId,
      question: question as SubmissionQuestionData<'RubricBasedResponse'>,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
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
        openAnswerHistoryView={openAnswerHistoryView}
        questionId={question.id}
        questionNumber={questionNumber}
        questionTitle={question.questionTitle}
      />

      {errorMessages.map((message) => (
        <Typography key={message} className="text-error" variant="body2">
          {message}
        </Typography>
      ))}

      {question.description && (
        <>
          <Typography color="text.secondary" variant="caption">
            {t(translations.questionDescription)}
          </Typography>
          <Typography
            dangerouslySetInnerHTML={{ __html: question.description }}
            variant="body2"
          />
          <Divider />
        </>
      )}

      <Typography color="text.secondary" variant="caption">
        {t(translations.questionAnswer)}
      </Typography>
      <Answer
        answerId={answerId}
        answerProps={answerPropsMap[questionType]}
        questionType={questionType}
      />
    </>
  );
};

export default memo(SubmissionAnswer, equal);
