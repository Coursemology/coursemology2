import { memo, useState } from 'react';
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
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

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
  onSaveAnswer: (data: unknown, answerId: number) => void;
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
    onSaveAnswer,
  } = props;

  const { t } = useTranslation();

  const [isFirstRendering, setIsFirstRendering] = useState({});

  const historyQuestion = historyQuestions[question.id];
  const noPastAnswers = historyQuestion
    ? historyQuestion.answerIds.length === 0
    : true;
  const isLoading = historyQuestion ? historyQuestion.isLoading : false;
  const isAutograding = questionsFlags[question.id]
    ? questionsFlags[question.id].isAutograding
    : false;
  const disabled = noPastAnswers || isLoading || isAutograding;

  const saveAnswer = (data: unknown, id: number): void => {
    onSaveAnswer(data, id);
    setIsFirstRendering((prevIsFirstRendering) => {
      const updatedIsFirstRendering = JSON.parse(
        JSON.stringify(prevIsFirstRendering),
      );
      updatedIsFirstRendering[id.toString()] = false;
      return updatedIsFirstRendering;
    });
  };

  const debouncedSaveAnswer = useDebounce(
    saveAnswer,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  let savingIndicator: React.ReactNode | null = null;

  if (!isSavingAnswer[answerId.toString()]) {
    savingIndicator = (
      <Tooltip title={t(translations.answerUnsavedHint)}>
        <Chip
          className="flex items-center align-middle"
          color="warning"
          label={t(translations.isUnsaved)}
          size="small"
        />
      </Tooltip>
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
  } else if (!(isFirstRendering[answerId.toString()] ?? true)) {
    savingIndicator = (
      <Chip
        className="flex items-center align-middle"
        color="success"
        label={t(translations.isSaved)}
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
          question={question}
          readOnly={readOnly}
          saveAnswer={debouncedSaveAnswer}
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
