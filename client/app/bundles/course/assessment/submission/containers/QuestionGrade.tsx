import { FC, useState } from 'react';
import { Chip, Paper, TextField, Tooltip, Typography } from '@mui/material';
import { QuestionType } from 'types/course/assessment/question';
import {
  SubmissionQuestionBaseData,
  SubmissionQuestionData,
} from 'types/course/assessment/submission/question/types';

import { FIELD_LONG_DEBOUNCE_DELAY_MS } from 'lib/constants/sharedConstants';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import { useDebounce } from 'lib/hooks/useDebounce';
import useTranslation from 'lib/hooks/useTranslation';

import { saveGrade, updateGrade } from '../actions/answers';
import { workflowStates } from '../constants';
import ReevaluateButton from '../pages/SubmissionEditIndex/components/button/ReevaluateButton';
import { computeExp } from '../reducers/grading';
import { QuestionGradeData } from '../reducers/grading/types';
import { getRubricCategoryGradesForAnswerId } from '../selectors/answers';
import { getAssessment } from '../selectors/assessments';
import {
  getBasePoints,
  getExpMultiplier,
  getMaximumGrade,
  getQuestionWithGrades,
} from '../selectors/grading';
import { getQuestions } from '../selectors/questions';
import { getSubmission } from '../selectors/submissions';
import translations from '../translations';
import { AnswerDetailsMap } from '../types';

import RubricPanel from './RubricPanel';

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

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);
  const questions = useAppSelector(getQuestions);
  const questionWithGrades = useAppSelector(getQuestionWithGrades);
  const submissionId = getSubmissionId();

  const { submittedAt, bonusEndAt, graderView, bonusPoints, workflowState } =
    submission;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;
  const question = questions[questionId] as SubmissionQuestionBaseData;
  const grading = questionWithGrades[questionId] as QuestionGradeData;
  const maxGrade = question.maximumGrade;

  const basePoints = useAppSelector(getBasePoints);
  const expMultiplier = useAppSelector(getExpMultiplier);
  const maximumGrade = useAppSelector(getMaximumGrade);
  const answerCategoryGradesFromStore = useAppSelector((state) =>
    grading ? getRubricCategoryGradesForAnswerId(state, grading.id) : [],
  );

  const attempting = workflowState === workflowStates.Attempting;
  const published = workflowState === workflowStates.Published;

  const isProgrammingQuestion = question.type === QuestionType.Programming;
  const editable = !attempting && graderView;

  const isNotGradedAndNotPublished =
    workflowState !== workflowStates.Graded &&
    workflowState !== workflowStates.Published;

  const isRubricBasedResponse =
    question.type === QuestionType.RubricBasedResponse;
  const isRubricVisible =
    isRubricBasedResponse &&
    (graderView || (published && assessment.showRubricToStudents));
  const isRubricBasedResponseAndAutogradable =
    isRubricBasedResponse &&
    (question as SubmissionQuestionData<QuestionType.RubricBasedResponse>)
      .aiGradingEnabled;

  const handleSaveGrade = (
    newGrade: string | number | null,
    id,
    oldQuestions,
  ): void => {
    const newQuestionWithGrades = {
      ...oldQuestions,
      [id]: {
        ...oldQuestions[id],
        grade: newGrade,
        autofilled: false,
      },
    };

    const newExpPoints = computeExp(
      newQuestionWithGrades,
      maximumGrade,
      basePoints,
      expMultiplier,
      bonusAwarded,
    );

    dispatch(
      saveGrade(
        submissionId,
        newQuestionWithGrades[id],
        id,
        newExpPoints,
        published,
      ),
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

  const updatedGrade = (
    value: string,
    drafting: boolean = false,
  ): string | number | null => {
    if (value.trim() === '') {
      return null;
    }

    if (drafting && !isValidDecimal(value)) {
      return null;
    }

    const parsedValue = parseFloat(value);

    if (!drafting && (Number.isNaN(parsedValue) || parsedValue < 0)) {
      return null;
    }

    if (parsedValue >= maxGrade) {
      return maxGrade;
    }

    return drafting ? value : parsedValue;
  };

  const processValue = (value: string, drafting: boolean = false): void => {
    if (drafting && !isValidDecimal(value)) {
      return undefined;
    }

    return handleUpdateGrade(questionId, updatedGrade(value, drafting));
  };

  const newGradeAfterStep = (delta: number): number => {
    const parsedValue =
      typeof grading.grade === 'string'
        ? parseFloat(grading.grade)
        : grading.grade ?? 0;
    return Math.max(Math.min(parsedValue + delta, maxGrade), 0);
  };

  const stepGrade = (delta: number): void => {
    return handleUpdateGrade(questionId, newGradeAfterStep(delta));
  };

  const renderQuestionGradeField = (): JSX.Element => (
    <div className="flex w-full items-center space-x-2">
      <div className="flex items-center space-x-4">
        <TextField
          className="w-40"
          disabled={isRubricBasedResponse}
          hiddenLabel
          inputProps={{ className: 'grade' }}
          onBlur={(e): void => processValue(e.target.value)}
          onChange={(e): void => {
            processValue(e.target.value, true);
            if (isNotGradedAndNotPublished) {
              debouncedSaveGrade(
                updatedGrade(e.target.value, true),
                questionId,
                questionWithGrades,
              );
            }
          }}
          onKeyDown={(e): void => {
            if (e.key === 'ArrowUp') {
              e.preventDefault();
              stepGrade(GRADE_STEP);
              if (isNotGradedAndNotPublished) {
                debouncedSaveGrade(
                  newGradeAfterStep(GRADE_STEP),
                  questionId,
                  questionWithGrades,
                );
              }
            }
            if (e.key === 'ArrowDown') {
              e.preventDefault();
              stepGrade(-GRADE_STEP);
              if (isNotGradedAndNotPublished) {
                debouncedSaveGrade(
                  newGradeAfterStep(-GRADE_STEP),
                  questionId,
                  questionWithGrades,
                );
              }
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

  const answerCategoryGrades = (
    isRubricVisible && grading ? answerCategoryGradesFromStore : undefined
  ) as AnswerDetailsMap['RubricBasedResponse']['categoryGrades'] | undefined;

  return (
    (editable || published) && (
      <>
        {isRubricVisible && answerCategoryGrades && (
          <RubricPanel
            answerCategoryGrades={answerCategoryGrades!}
            answerId={grading.id}
            question={question as SubmissionQuestionData<'RubricBasedResponse'>}
            setIsFirstRendering={setIsFirstRendering}
          />
        )}

        {editable &&
          (isProgrammingQuestion || isRubricBasedResponseAndAutogradable) && (
            <ReevaluateButton questionId={questionId} />
          )}

        <Paper
          className={`transition-none flex items-center space-x-5 px-5 py-4 ring-2 ${
            dirty
              ? 'ring-2 ring-warning border-transparent'
              : 'ring-transparent'
          }`}
          variant="outlined"
        >
          <Typography color="text.secondary" variant="body1">
            {t(translations.grade)}
          </Typography>

          {editable ? renderQuestionGradeField() : renderQuestionGrade()}
        </Paper>
      </>
    )
  );
};

export default QuestionGrade;
