import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { Chip, Paper, TextField, Tooltip, Typography } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';

import actionTypes from '../constants';
import { QuestionData, QuestionGradeData } from '../questionGrade';
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

interface Props extends WrappedComponentProps {
  editable: boolean;
  questionId: number;
  handleSaveGrade: (id: number) => void;
}

const QuestionGrade: FC<Props> = (props) => {
  const { editable, questionId, handleSaveGrade, intl } = props;

  const dispatch = useAppDispatch();

  const submission = useAppSelector((state) => state.assessments.submission);
  const { submittedAt, bonusEndAt, bonusPoints } = submission.submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  const question = submission.questions[questionId] as QuestionData;
  const grading = submission.grading.questions[questionId] as QuestionGradeData;
  const maxGrade = question.maximumGrade;

  if (!grading) return null;

  const dirty = (grading.originalGrade ?? 0) !== (grading.grade ?? 0);

  const updateGrade = (id: number, grade: number | string | null): void => {
    dispatch({
      type: actionTypes.UPDATE_GRADING,
      id,
      grade,
      bonusAwarded,
    });
  };

  const processValue = (value: string, drafting: boolean = false): void => {
    if (value.trim() === '') {
      updateGrade(questionId, null);
      return;
    }

    if (drafting && !isValidDecimal(value)) return;

    const parsedValue = parseFloat(value);

    if (!drafting && (Number.isNaN(parsedValue) || parsedValue < 0)) {
      updateGrade(questionId, null);
      return;
    }

    if (parsedValue >= maxGrade) {
      updateGrade(questionId, maxGrade);
      return;
    }

    updateGrade(questionId, drafting ? value : parsedValue);
  };

  const stepGrade = (delta: number): void => {
    const parsedValue =
      typeof grading.grade === 'string'
        ? parseFloat(grading.grade)
        : grading.grade ?? 0;
    const newGrade = Math.max(Math.min(parsedValue + delta, maxGrade), 0);
    updateGrade(questionId, newGrade);
  };

  const renderQuestionGradeField = (): JSX.Element => (
    <div className="flex w-full items-center space-x-2">
      <div className="flex items-center space-x-4">
        <TextField
          className="w-40"
          hiddenLabel
          inputProps={{ className: 'grade' }}
          onBlur={(e): void => {
            handleSaveGrade(questionId);
            processValue(e.target.value);
          }}
          onChange={(e): void => processValue(e.target.value, true)}
          onKeyDown={(e): void => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              stepGrade(GRADE_STEP);
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              stepGrade(-GRADE_STEP);
            }
          }}
          placeholder={
            typeof grading.originalGrade === 'number'
              ? grading.originalGrade.toString()
              : grading.originalGrade
          }
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
          <Tooltip title={intl.formatMessage(translations.gradePrefilledHint)}>
            <Chip
              className="slot-1-neutral-400 border-slot-1 text-slot-1"
              label={intl.formatMessage(translations.gradePrefilled)}
              size="small"
              variant="outlined"
            />
          </Tooltip>
        )}

        {dirty && (
          <Tooltip title={intl.formatMessage(translations.gradeUnsavedHint)}>
            <Chip
              color="warning"
              label={intl.formatMessage(translations.gradeUnsaved)}
              size="small"
            />
          </Tooltip>
        )}
      </div>
    </div>
  );

  const renderQuestionGrade = (): JSX.Element => (
    <Typography variant="body2">
      {`${grading.grade} / ${question.maximumGrade}`}
    </Typography>
  );

  return (
    <Paper
      className={`transition-none flex items-center space-x-5 px-5 py-4 ring-2 ${
        dirty ? 'ring-2 ring-warning border-transparent' : 'ring-transparent'
      }`}
      variant="outlined"
    >
      <Typography color="text.secondary" variant="body1">
        {intl.formatMessage(translations.grade)}
      </Typography>

      {editable ? renderQuestionGradeField() : renderQuestionGrade()}
    </Paper>
  );
};

export default injectIntl(QuestionGrade);
