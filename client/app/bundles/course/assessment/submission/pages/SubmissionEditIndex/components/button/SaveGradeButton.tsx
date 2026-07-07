import { FC } from 'react';
import { Button } from '@mui/material';

import { saveAllGrades } from 'course/assessment/submission/actions/answers';
import { workflowStates } from 'course/assessment/submission/constants';
import { getRubricCategoryGrades } from 'course/assessment/submission/selectors/answers';
import {
  getExperiencePoints,
  getQuestionWithGrades,
} from 'course/assessment/submission/selectors/grading';
import { getSubmissionFlags } from 'course/assessment/submission/selectors/submissionFlags';
import { getSubmission } from 'course/assessment/submission/selectors/submissions';
import translations from 'course/assessment/submission/translations';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

const SaveGradeButton: FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const submission = useAppSelector(getSubmission);
  const submissionFlags = useAppSelector(getSubmissionFlags);
  const expPoints = useAppSelector(getExperiencePoints);
  const questionWithGrades = useAppSelector(getQuestionWithGrades);

  const submissionId = getSubmissionId();

  const { graderView, workflowState } = submission;
  const { isSaving } = submissionFlags;

  const attempting = workflowState === workflowStates.Attempting;
  const published = workflowState === workflowStates.Published;

  // categoryGrade is keyed by question id; saveAllGrades keys its payload by answer id, so map each
  // question's breakdown onto its answer id (questionWithGrades[questionId].id is the answer id).
  const categoryGrade = useAppSelector(getRubricCategoryGrades);
  const categoryGradeDetail: Record<number, unknown> = {};

  Object.entries(questionWithGrades).forEach(([questionId, grade]) => {
    const categories = categoryGrade[Number(questionId)];
    // Only rubric-graded answers (a non-empty breakdown) go through the rubric save path -- matching the
    // rubric panel's visibility gate. An empty breakdown (e.g. a default-graded forum answer) must fall
    // through to the plain grade save, or saveAllGrades would recompute its grade from nothing (0).
    if (categories && categories.length > 0) {
      categoryGradeDetail[grade.id] = categories.reduce(
        (obj, category) => ({
          ...obj,
          [category.categoryId]: {
            id: category.id,
            gradeId: category.gradeId,
            grade: category.grade,
            explanation: category.explanation,
          },
        }),
        {},
      );
    }
  });

  const handleSaveAllGrades = (): void => {
    dispatch(
      saveAllGrades(
        submissionId,
        Object.values(questionWithGrades),
        expPoints,
        published,
        categoryGradeDetail,
      ),
    );
  };

  return (
    graderView &&
    !attempting && (
      <Button
        className="mb-2 mr-2"
        color="primary"
        disabled={isSaving}
        onClick={handleSaveAllGrades}
        variant="contained"
      >
        {t(translations.saveGrade)}
      </Button>
    )
  );
};

export default SaveGradeButton;
