import { memo } from 'react';
import { useFormContext } from 'react-hook-form';
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
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

import {
  importFiles,
  saveAnswer,
  updateClientVersion,
  uploadFiles,
} from '../actions';
import { saveStatus } from '../constants';
import { HistoryQuestion, SubmissionQuestionData } from '../questionGrade';
import translations from '../translations';

import Answer, { AnswerMapper } from './Answer';

interface Props {
  handleToggleViewHistoryMode: (
    viewHistory: boolean,
    submissionQuestionId: number,
    questionId: number,
  ) => void;
  historyQuestions: Record<string, HistoryQuestion>;
  readOnly?: boolean;
  graderView: boolean;
  showMcqMrqSolution: boolean;
  question: SubmissionQuestionData;
  answerId: number;
  savingStatus: Record<string, string>;
}

const SavingIndicator = (
  savingStatus: Record<string, string>,
  answerId?: number,
): JSX.Element | null => {
  const { t } = useTranslation();

  if (!answerId) return null;

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
  disabled: boolean,
  handleToggleViewHistoryMode: (
    viewHistory: boolean,
    submissionQuestionId: number,
    questionId: number,
  ) => void,
  answerId?: number,
): JSX.Element | null => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center">
      {!readOnly && SavingIndicator(savingStatus, answerId)}
      {question.canViewHistory && (
        <div className="flex flex-grow justify-end">
          {isLoading && (
            <CircularProgress className="inline-block align-middle" size={30} />
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
      )}
    </div>
  );
};

const SubmissionAnswer = (props: Props): JSX.Element => {
  const {
    handleToggleViewHistoryMode,
    historyQuestions,
    readOnly = false,
    graderView,
    showMcqMrqSolution,
    question,
    answerId,
    savingStatus,
  } = props;

  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const submissionId = getSubmissionId();

  const historyQuestion = historyQuestions[question.id];
  const noPastAnswers = historyQuestion
    ? historyQuestion.answerIds.length === 0
    : true;
  const isLoading = historyQuestion ? historyQuestion.isLoading : false;
  const disabled = noPastAnswers || isLoading;
  const { resetField } = useFormContext();

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
    dispatch(saveAnswer(submissionId, data, savedAnswerId, currentTime));
  };

  const handleImportFiles = (
    savedAnswerId: number,
    answerFields: Object,
    language: string,
  ): void => {
    dispatch(
      importFiles(
        savedAnswerId,
        {
          ...answerFields,
          [savedAnswerId]: {
            ...answerFields[savedAnswerId],
            clientVersion: Date.now(),
          },
        },
        language,
        resetField,
      ),
    );
  };

  const handleUploadFiles = (
    savedAnswerId: number,
    answerFields: Object,
  ): void => {
    dispatch(
      uploadFiles(
        savedAnswerId,
        {
          [savedAnswerId]: {
            ...answerFields,
            clientVersion: Date.now(),
          },
        },
        resetField,
      ),
    );
  };

  const debouncedSaveAnswer = useDebounce(
    handleSaveAnswer,
    question.type === 'VoiceResponse' ? 0 : FIELD_LONG_DEBOUNCE_DELAY_MS,
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

  const isSavingAnswer: boolean =
    savingStatus[answerId?.toString()] === saveStatus.Saving ?? false;

  const answerProps = {
    MultipleChoice: {
      question,
      answerId,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    MultipleResponse: {
      question,
      answerId,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      showMcqMrqSolution,
    },
    Programming: {
      question,
      answerId,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      importFiles: handleImportFiles,
      isSavingAnswer,
    },
    TextResponse: {
      question,
      answerId,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      isSavingAnswer,
      uploadFiles: handleUploadFiles,
    },
    Comprehension: {
      question,
      answerId,
      readOnly,
      saveAnswerAndUpdateClientVersion,
      graderView,
      isSavingAnswer,
      uploadFiles: handleUploadFiles,
    },
    FileUpload: {
      question,
      answerId,
      readOnly,
      graderView,
      isSavingAnswer,
      uploadFiles: handleUploadFiles,
    },
    VoiceResponse: {
      question,
      answerId,
      readOnly,
      saveAnswerAndUpdateClientVersion,
    },
    ForumPostResponse: {
      question,
      answerId,
      readOnly,
      saveAnswerAndUpdateClientVersion,
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
        <Typography variant="h6">{question.questionNumber}</Typography>
        {HistoryToggle(
          question,
          readOnly,
          isLoading,
          noPastAnswers,
          savingStatus,
          disabled,
          handleToggleViewHistoryMode,
          answerId,
        )}
      </div>
      <Divider />

      <Typography className="mt-2" variant="body1">
        {question.questionTitle}
      </Typography>

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
