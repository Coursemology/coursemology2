import { FC, useEffect, useState } from 'react';
import { TableCell, TableRow, Typography } from '@mui/material';
import { AnswerRubricGradeData } from 'types/course/assessment/question/rubric-based-responses';
import { SubmissionQuestionData } from 'types/course/assessment/submission/question/types';

import NumberTextField from 'lib/components/core/fields/NumberTextField';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { updateGrade as updateGradeState } from '../actions/answers';
import { workflowStates } from '../constants';
import { getMaximumGrade, getQuestionWithGrades } from '../selectors/grading';
import { getQuestionFlags } from '../selectors/questionFlags';
import { getSubmissionFlags } from '../selectors/submissionFlags';
import { getSubmission } from '../selectors/submissions';
import translations from '../translations';
import { sumRubricBreakdown } from '../utils/rubrics';

import { useSaveRubricGrade } from './useSaveRubricGrade';

interface RubricModerationRowProps {
  answerId: number;
  currentGrade: number;
  question: SubmissionQuestionData<'RubricBasedResponse'>;
  categoryGrades: Record<number, AnswerRubricGradeData>;
  setIsFirstRendering: (isFirstRendering: boolean) => void;
  readOnly?: boolean;
}

// The "moderation" grade is the part of the answer's grade not explained by the criterion breakdown -- a
// manual adjustment. It is FE-only (no category/selection in v2): it is derived as answer.grade minus the
// breakdown, and editing it sets the grade to breakdown + moderation.
const RubricModerationRow: FC<RubricModerationRowProps> = (props) => {
  const {
    answerId,
    currentGrade,
    question,
    categoryGrades,
    setIsFirstRendering,
    readOnly = false,
  } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const maximumGrade = useAppSelector(getMaximumGrade);
  const questionWithGrades = useAppSelector(getQuestionWithGrades);
  const questionFlags = useAppSelector(getQuestionFlags);
  const submissionFlags = useAppSelector(getSubmissionFlags);

  const { graderView, workflowState, submittedAt, bonusEndAt, bonusPoints } =
    submission;
  const attempting = workflowState === workflowStates.Attempting;
  const editable = !attempting && graderView && !readOnly;
  const isAutograding =
    submissionFlags?.isAutograding || questionFlags[question.id]?.isAutograding;
  const isNotGradedAndNotPublished =
    workflowState !== workflowStates.Graded &&
    workflowState !== workflowStates.Published;
  const bonusAwarded =
    new Date(submittedAt) < new Date(bonusEndAt) ? bonusPoints : 0;

  const debouncedUpdateRubricGrade = useSaveRubricGrade(answerId, question);

  const breakdown = sumRubricBreakdown(categoryGrades);
  const moderation = currentGrade - breakdown;

  // The field holds its own text so intermediate inputs (e.g. "-" or "1.") can be displayed while typing.
  // A numeric controlled value would discard these, making it impossible to type a negative moderation.
  const [moderationText, setModerationText] = useState(String(moderation));

  // Resync when `moderation` changes for external reasons (e.g. a category grade edit changed the
  // breakdown). Skipped when the text already represents the same value, so mid-edit inputs like "-" or
  // "1." are not clobbered by our own committed grade updates.
  useEffect(() => {
    if (Number(moderationText) !== moderation)
      setModerationText(String(moderation));
  }, [moderation]);

  const handleOnChange = (_event, value: string | number): void => {
    const text = String(value);
    setModerationText(text);

    const newModeration = text === '' ? 0 : Number(text);
    // Intermediate values ("-", ".", "-.") parse to NaN: keep showing them, but don't commit a grade yet.
    if (Number.isNaN(newModeration)) return;

    const finalGrade = Math.max(
      0,
      Math.min(breakdown + newModeration, maximumGrade),
    );

    setIsFirstRendering(false);
    dispatch(updateGradeState(question.id, finalGrade, bonusAwarded));
    if (isNotGradedAndNotPublished) {
      debouncedUpdateRubricGrade(
        categoryGrades,
        question.id,
        questionWithGrades,
        finalGrade,
      );
    }
  };

  return (
    <TableRow>
      <TableCell className="w-[10%] text-wrap">
        {t(translations.moderation)}
      </TableCell>
      <TableCell className="w-[80%] text-wrap text-neutral-400">
        <Typography variant="body2">
          {t(translations.moderationHint)}
        </Typography>
      </TableCell>
      <TableCell className="w-[5%] text-wrap px-0 text-center">
        {editable ? (
          <NumberTextField
            className="w-full max-w-3xl"
            disabled={isAutograding}
            id="moderation-grade"
            InputProps={{ classes: { input: 'text-center' } }}
            onChange={handleOnChange}
            value={moderationText}
            variant="outlined"
          />
        ) : (
          <Typography variant="body2">{moderation}</Typography>
        )}
      </TableCell>
      <TableCell className="px-0 text-center" />
      <TableCell className="w-[5%] text-wrap px-0 text-center" />
    </TableRow>
  );
};

export default RubricModerationRow;
