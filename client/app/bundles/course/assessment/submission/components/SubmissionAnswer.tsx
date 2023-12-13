import { memo } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
import { Cancel, CheckCircle } from '@mui/icons-material';
import {
  Alert,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material';
import equal from 'fast-deep-equal';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

import { importFiles, updateClientVersion, uploadFiles } from '../actions';
import { saveStatus } from '../constants';
import {
  HistoryQuestion,
  QuestionFlags,
  SubmissionQuestionData,
} from '../questionGrade';
import translations from '../translations';

import Answer, { AnswerMapper } from './Answer';

interface Props {
  handleToggleViewHistoryMode: (
    viewHistory: boolean,
    submissionQuestionId: number,
    questionId: number,
  ) => void;
  historyQuestions: Record<string, HistoryQuestion>;
  questionsFlags: Record<string, QuestionFlags>;
  readOnly?: boolean;
  graderView: boolean;
  showMcqMrqSolution: boolean;
  question: SubmissionQuestionData;
  answerId: number;
  savingStatus: Record<string, string>;
  onSaveAnswer: (data: unknown, answerId: number, currentTime: number) => void;
}

const SavingIndicator = (
  answerId: number,
  savingStatus: Record<string, string>,
): JSX.Element | null => {
  const { t } = useTranslation();

  if (savingStatus[answerId.toString()] === saveStatus.Saving) {
    return (
      <div className="flex items-center align-middle">
        <Chip
          color="default"
          icon={<LoadingIndicator bare size={20} />}
          label={t(translations.isSaving)}
          size="medium"
          variant="outlined"
        />
      </div>
    );
  }

  if (savingStatus[answerId.toString()] === saveStatus.Saved) {
    return (
      <div className="flex items-center align-middle">
        <Chip
          color="success"
          icon={<CheckCircle />}
          label={t(translations.isSaved)}
          size="medium"
          variant="outlined"
        />
      </div>
    );
  }

  if (savingStatus[answerId.toString()] === saveStatus.Failed) {
    return (
      <div className="flex items-center align-middle">
        <Chip
          color="error"
          icon={<Cancel />}
          label={t(translations.isSavingFailed)}
          size="medium"
          variant="outlined"
        />
      </div>
    );
  }

  return null;
};

const HistoryToggle = (
  question: SubmissionQuestionData,
  readOnly: boolean,
  isLoading: boolean,
  noPastAnswers: boolean,
  savingStatus: Record<string, string>,
  answerId: number,
  disabled: boolean,
  handleToggleViewHistoryMode: (
    viewHistory: boolean,
    submissionQuestionId: number,
    questionId: number,
  ) => void,
): JSX.Element | null => {
  const { t } = useTranslation();

  return (
    <div className="flex w-full flex-wrap justify-between">
      {question.canViewHistory && (
        <>
          {!readOnly && SavingIndicator(answerId, savingStatus)}
          <div className="flex flex-grow justify-end">
            {isLoading && (
              <CircularProgress
                className="inline-block align-middle"
                size={30}
              />
            )}
            <Tooltip title={noPastAnswers ? t(translations.noPastAnswers) : ''}>
              <FormControlLabel
                className="float-right"
                control={
                  <Switch
                    checked={question.viewHistory || false}
                    className="toggle-history"
                    color="primary"
                    onChange={(): void =>
                      handleToggleViewHistoryMode(
                        !question.viewHistory,
                        question.submissionQuestionId,
                        question.id,
                      )
                    }
                  />
                }
                disabled={disabled}
                label={<b>{t(translations.viewPastAnswers)}</b>}
                labelPlacement="start"
              />
            </Tooltip>
          </div>
        </>
      )}
    </div>
  );
};

const SubmissionAnswer = (props: Props): JSX.Element => {
  const {
    handleToggleViewHistoryMode,
    historyQuestions,
    questionsFlags,
    readOnly = false,
    graderView,
    showMcqMrqSolution,
    question,
    answerId,
    savingStatus,
    onSaveAnswer,
  } = props;

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const historyQuestion = historyQuestions[question.id];
  const noPastAnswers = historyQuestion
    ? historyQuestion.answerIds.length === 0
    : true;
  const isLoading = historyQuestion ? historyQuestion.isLoading : false;
  const isAutograding = questionsFlags[question.id]
    ? questionsFlags[question.id].isAutograding
    : false;
  const disabled = noPastAnswers || isLoading || isAutograding;

  const handleUpdateClientVersion = (
    savedAnswerId: number,
    clientVersion: number,
  ): void => {
    dispatch(updateClientVersion(savedAnswerId, clientVersion));
  };

  const handleSaveAnswer = (
    data: unknown,
    savedAnswerId: number,
    currentTime: number,
  ): void => {
    onSaveAnswer(data, savedAnswerId, currentTime);
  };

  const handleImportFiles = (
    savedAnswerId: number,
    answerFields: unknown,
    language: string,
    setValue: UseFormSetValue<FieldValues>,
  ): void => {
    dispatch(importFiles(savedAnswerId, answerFields, language, setValue));
  };

  const handleUploadFiles = (
    savedAnswerId: number,
    answerFields: unknown,
    setValue: UseFormSetValue<FieldValues>,
  ): void => {
    dispatch(
      uploadFiles(savedAnswerId, { [savedAnswerId]: answerFields }, setValue),
    );
  };

  const debouncedSaveAnswer = useDebounce(
    handleSaveAnswer,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const saveAnswerAndUpdateClientVersion = (
    data: unknown,
    savedAnswerId: number,
  ): void => {
    const currentTime = Date.now();
    handleUpdateClientVersion(savedAnswerId, currentTime);
    debouncedSaveAnswer({ [savedAnswerId]: data }, savedAnswerId, currentTime);
  };

  const MissingAnswer = (): JSX.Element => {
    return <Alert severity="warning">{t(translations.missingAnswer)}</Alert>;
  };

  const answerProps = {
    MultipleChoice: {
      question,
      answerId,
      readOnly,
      saveAnswer: saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    MultipleResponse: {
      question,
      answerId,
      readOnly,
      saveAnswer: saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    Programming: {
      question,
      answerId,
      readOnly,
      saveAnswer: saveAnswerAndUpdateClientVersion,
      importFiles: handleImportFiles,
      isSavingAnswer: savingStatus[answerId.toString()] === saveStatus.Saving,
    },
    TextResponse: {
      question,
      answerId,
      readOnly,
      saveAnswer: saveAnswerAndUpdateClientVersion,
      graderView,
      isSavingAnswer: savingStatus[answerId.toString()] === saveStatus.Saving,
      uploadFiles: handleUploadFiles,
    },
    Comprehension: {
      question,
      answerId,
      readOnly,
      saveAnswer: saveAnswerAndUpdateClientVersion,
      graderView,
      isSavingAnswer: savingStatus[answerId.toString()] === saveStatus.Saving,
      uploadFiles: handleUploadFiles,
    },
    FileUpload: {
      question,
      answerId,
      readOnly,
      graderView,
      isSavingAnswer: savingStatus[answerId.toString()] === saveStatus.Saving,
      uploadFiles: handleUploadFiles,
    },
    VoiceResponse: {
      question,
      answerId,
      readOnly,
      saveAnswer: saveAnswerAndUpdateClientVersion,
      savingIndicator: SavingIndicator(answerId, savingStatus),
    },
    ForumPostResponse: {
      question,
      answerId,
      readOnly,
      saveAnswer: saveAnswerAndUpdateClientVersion,
      savingIndicator: SavingIndicator(answerId, savingStatus),
    },
    Scribing: {
      question,
      answerId,
      readOnly,
    },
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Typography variant="h6">{question.displayTitle}</Typography>
        {SavingIndicator(answerId, savingStatus)}
        {HistoryToggle(
          question,
          readOnly,
          isLoading,
          noPastAnswers,
          savingStatus,
          answerId,
          disabled,
          handleToggleViewHistoryMode,
        )}
      </div>

      <Typography
        dangerouslySetInnerHTML={{ __html: question.description }}
        variant="body2"
      />
      {readOnly && <Divider />}
      {answerId ? (
        <Answer
          answerProps={answerProps[question.type]}
          question={question}
          type={question.type as keyof typeof AnswerMapper}
        />
      ) : (
        <MissingAnswer />
      )}
    </>
  );
};

export default memo(SubmissionAnswer, equal);
