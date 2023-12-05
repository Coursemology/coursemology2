import { memo, useState } from 'react';
import { FieldValues, UseFormSetValue } from 'react-hook-form';
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

import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { useAppDispatch } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

import { importFiles, updateClientVersion } from '../actions';
import {
  HistoryQuestion,
  QuestionFlags,
  SubmissionQuestionData,
} from '../questionGrade';
import translations from '../translations';

import Answer from './Answer';

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
  isSavingAnswer: Record<string, boolean>;
  isSavingAnswerFailed: Record<string, boolean>;
  onSaveAnswer: (data: unknown, answerId: number, currentTime: number) => void;
}

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
    isSavingAnswer,
    isSavingAnswerFailed,
    onSaveAnswer,
  } = props;

  const { t } = useTranslation();

  const [isFirstRendering, setIsFirstRendering] = useState({});
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
    setIsFirstRendering((prevIsFirstRendering) => {
      const updatedIsFirstRendering = JSON.parse(
        JSON.stringify(prevIsFirstRendering),
      );
      updatedIsFirstRendering[savedAnswerId.toString()] = false;
      return updatedIsFirstRendering;
    });
  };

  const handleImportFiles = (
    savedAnswerId: number,
    answerFields: unknown,
    language: string,
    setValue: UseFormSetValue<FieldValues>,
  ): void => {
    dispatch(importFiles(savedAnswerId, answerFields, language, setValue));
    setIsFirstRendering((prevIsFirstRendering) => {
      const updatedIsFirstRendering = JSON.parse(
        JSON.stringify(prevIsFirstRendering),
      );
      updatedIsFirstRendering[savedAnswerId.toString()] = false;
      return updatedIsFirstRendering;
    });
  };

  const debouncedImportFiles = useDebounce(
    handleImportFiles,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const debouncedSaveAnswer = useDebounce(
    handleSaveAnswer,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  const saveAnswerAndUpdateClientVersion = (
    data: unknown,
    savedAnswerId: number,
    currentTime: number,
  ): void => {
    handleUpdateClientVersion(savedAnswerId, currentTime);
    debouncedSaveAnswer(data, savedAnswerId, currentTime);
  };

  let savingIndicator: React.ReactNode | null = null;

  if (!isSavingAnswer[answerId.toString()]) {
    savingIndicator = (
      <Chip
        className="flex items-center align-middle"
        color="warning"
        label={t(translations.isUnsaved)}
        size="small"
      />
    );
  } else if (isSavingAnswer[answerId.toString()]) {
    savingIndicator = (
      <Chip
        className="flex items-center align-middle"
        color="default"
        label={t(translations.isSaving)}
        size="small"
      />
    );
  } else if (
    !(isFirstRendering[answerId.toString()] ?? true) &&
    !isSavingAnswerFailed[answerId.toString()]
  ) {
    savingIndicator = (
      <Chip
        className="flex items-center align-middle"
        color="success"
        label={t(translations.isSaved)}
        size="small"
      />
    );
  } else if (isSavingAnswerFailed[answerId.toString()]) {
    savingIndicator = (
      <Chip
        className="flex items-center align-middle"
        color="error"
        label={t(translations.isSavingFailed)}
        size="small"
      />
    );
  }

  const HistoryToggle = (): JSX.Element | null => {
    return (
      <div className="flex w-full flex-wrap justify-between">
        {question.canViewHistory && (
          <>
            {!readOnly && savingIndicator}
            <div className="flex flex-grow justify-end">
              {isLoading && (
                <CircularProgress
                  className="inline-block align-middle"
                  size={30}
                />
              )}
              <Tooltip
                title={noPastAnswers ? t(translations.noPastAnswers) : ''}
              >
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

  const MissingAnswer = (): JSX.Element => {
    return <Alert severity="warning">{t(translations.missingAnswer)}</Alert>;
  };

  return (
    <>
      <div className="flex items-start justify-between">
        <Typography variant="h6">{question.displayTitle}</Typography>
        <HistoryToggle />
      </div>

      <Typography
        dangerouslySetInnerHTML={{ __html: question.description }}
        variant="body2"
      />
      {readOnly && <Divider />}
      {answerId ? (
        <Answer
          answerId={answerId}
          graderView={graderView}
          importFiles={debouncedImportFiles}
          isSavingAnswer={isSavingAnswer[answerId.toString()]}
          question={question}
          readOnly={readOnly}
          saveAnswer={saveAnswerAndUpdateClientVersion}
          savingIndicator={savingIndicator}
          showMcqMrqSolution={showMcqMrqSolution}
        />
      ) : (
        <MissingAnswer />
      )}
    </>
  );
};

export default memo(SubmissionAnswer, equal);
