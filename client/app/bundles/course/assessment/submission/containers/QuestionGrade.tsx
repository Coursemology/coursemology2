import { FC, useState } from 'react';
import { Chip, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { SubmissionQuestionBaseData } from 'types/course/assessment/submission/question/types';

import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

import { saveGrade, updateGrade } from '../actions/answers';
import { workflowStates } from '../constants';
import { QuestionGradeData } from '../reducers/grading/types';
import {
  getExperiencePoints,
  getQuestionWithGrades,
} from '../selectors/grading';
import { getQuestions } from '../selectors/questions';
import { getSubmission } from '../selectors/submissions';
import translations from '../translations';

const GRADE_STEP = 1;

/**
 * Checks if the given value is a valid decimal of the form `0.00`.
 *
 * @param {string} value the string to be checked
 * @returns `true` if `value` is a valid decimal
 */
const isValidDecimal = (value: string): boolean => {
  return /^\d*(\.\d?)?$/.test(value);
};

interface QuestionGradeProps {
  questionId: number;
  isSaving: boolean;
}

const QuestionGrade: FC<QuestionGradeProps> = (props) => {
  const { questionId, isSaving } = props;

  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const [isFirstRendering, setIsFirstRendering] = useState(true);

  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const questionWithGrades = useAppSelector(getQuestionWithGrades);
  const expPoints = useAppSelector(getExperiencePoints);

  const submissionId = getSubmissionId();

  const { submittedAt, bonusEndAt, graderView, bonusPoints, workflowState } =
    submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  const question = questions[questionId] as SubmissionQuestionBaseData;
  const grading = questionWithGrades[questionId] as QuestionGradeData;
  const maxGrade = question.maximumGrade;

  const attempting = workflowState === workflowStates.Attempting;
  const published = workflowState === workflowStates.Published;

  const editable = !attempting && graderView;

  const isNotGradedAndNotPublished =
    workflowState !== workflowStates.Graded &&
    workflowState !== workflowStates.Published;

  const handleSaveGrade = (): void => {
    dispatch(
      saveGrade(submissionId, grading, questionId, expPoints, published),
    );
    setIsFirstRendering(false);
  };

  const debouncedSaveGrade = useDebounce(
    handleSaveGrade,
    FIELD_LONG_DEBOUNCE_DELAY_MS,
    [],
  );

  if (!grading) return null;

  const dirty = (grading.originalGrade ?? 0) !== (grading.grade ?? 0);

  let savingIndicator: React.ReactNode | null = null;

  if (dirty && !isSaving) {
    savingIndicator = (
      <Tooltip title={t(translations.gradeUnsavedHint)}>
        <Chip color="warning" label={t(translations.isUnsaved)} size="small" />
      </Tooltip>
    );
  } else if (isSaving) {
    savingIndicator = (
      <Chip color="default" label={t(translations.isSaving)} size="small" />
    );
  } else if (!isFirstRendering) {
    savingIndicator = (
      <Chip color="success" label={t(translations.isSaved)} size="small" />
    );
  }

  const handleUpdateGrade = (
    id: number,
    grade: number | string | null,
  ): void => {
    dispatch(updateGrade(id, grade, bonusAwarded));
  };

  const processValue = (value: string, drafting: boolean = false): void => {
    if (value.trim() === '') {
      return handleUpdateGrade(questionId, null);
    }

    if (drafting && !isValidDecimal(value)) {
      return undefined;
    }

    const parsedValue = parseFloat(value);

    if (!drafting && (Number.isNaN(parsedValue) || parsedValue < 0)) {
      return handleUpdateGrade(questionId, null);
    }

    if (parsedValue >= maxGrade) {
      return handleUpdateGrade(questionId, maxGrade);
    }

    return handleUpdateGrade(questionId, drafting ? value : parsedValue);
  };

  const stepGrade = (delta: number): void => {
    const parsedValue =
      typeof grading.grade === 'string'
        ? parseFloat(grading.grade)
        : grading.grade ?? 0;
    const newGrade = Math.max(Math.min(parsedValue + delta, maxGrade), 0);
    return handleUpdateGrade(questionId, newGrade);
  };

  const renderQuestionGradeField = (): JSX.Element => (
    <div className="flex w-full items-center space-x-2">
      <div className="flex items-center space-x-4">
        <TextField
          className="w-40"
          hiddenLabel
          inputProps={{ className: 'grade' }}
          onBlur={(e): void => processValue(e.target.value)}
          onChange={(e): void => {
            processValue(e.target.value, true);
            if (isNotGradedAndNotPublished) {
              debouncedSaveGrade();
            }
          }}
          onKeyDown={(e): void => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              stepGrade(GRADE_STEP);
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              stepGrade(-GRADE_STEP);
            }
            if (isNotGradedAndNotPublished) {
              debouncedSaveGrade();
            }
          }}
          placeholder={grading.originalGrade?.toString() ?? ''}
          size="small"
          value={grading.grade ?? ''}
          variant="filled"
        />

        <Typography color="text.disabled" variant="body2">
          /
        </Typography>

        <Typography variant="body2">{maxGrade}</Typography>
      </div>

      <div className="px-4 space-x-4">
        {grading.prefilled && (
          <Tooltip title={t(translations.gradePrefilledHint)}>
            <Chip
              className="slot-1-neutral-400 border-slot-1 text-slot-1"
              label={t(translations.gradePrefilled)}
              size="small"
              variant="outlined"
            />
          </Tooltip>
        )}

        {savingIndicator}
      </div>
    </div>
  );

  const renderQuestionGrade = (): JSX.Element => (
    <Typography variant="body2">
      {`${grading.grade} / ${question.maximumGrade}`}
    </Typography>
  );

  return (
    (editable || published) && (
      <Paper
        className={`transition-none flex items-center space-x-5 px-5 py-4 ring-2 ${
          dirty ? 'ring-2 ring-warning border-transparent' : 'ring-transparent'
        }`}
        variant="outlined"
      >
        <Typography color="text.secondary" variant="body1">
          {t(translations.grade)}
        </Typography>

        {editable ? renderQuestionGradeField() : renderQuestionGrade()}
      </Paper>
    )
  );
};

export default QuestionGrade;
