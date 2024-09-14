import { FC, useState } from 'react';
import { Switch } from '@mui/material';

import { updateProgrammingQuestionLiveFeedbackEnabledForAssessments } from 'course/admin/reducers/codaveriSettings';
import { updateLiveFeedbackForAllQuestionsInAssessment } from 'course/assessment/operations/assessments';
import Prompt from 'lib/components/core/dialogs/Prompt';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateLiveFeedbackEnabledForAllQuestions } from '../../operations';
import { getProgrammingQuestionsForAssessments } from '../../selectors';
import translations from '../../translations';
import CodaveriSettingsChip from '../CodaveriSettingsChip';

interface LiveFeedbackToggleButtonProps {
  assessmentIds: number[];
  for: string;
  isSpecificAssessment?: boolean;
  isCourseCodaveriEnabled?: boolean;
}

const LiveFeedbackToggleButton: FC<LiveFeedbackToggleButtonProps> = (props) => {
  const {
    assessmentIds,
    for: title,
    isSpecificAssessment,
    isCourseCodaveriEnabled,
  } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const programmingQuestions = useAppSelector((state) =>
    getProgrammingQuestionsForAssessments(state, assessmentIds),
  );

  const [isLiveFeedbackUpdating, setIsLiveFeedbackUpdating] = useState(false);
  const [
    liveFeedbackSettingsConfirmation,
    setLiveFeedbackSettingsConfirmation,
  ] = useState(false);
  const [isLiveFeedbackChecked, setLiveFeedbackChecked] = useState(false);

  const qnsWithLiveFeedbackEnabled = programmingQuestions.filter(
    (question) => question.liveFeedbackEnabled,
  );

  const hasNoProgrammingQuestions = programmingQuestions.length === 0;

  const updateLiveFeedbackEnabled = (
    liveFeedbackEnabled: boolean,
  ): Promise<void> =>
    isSpecificAssessment
      ? updateLiveFeedbackForAllQuestionsInAssessment(
          assessmentIds[0],
          liveFeedbackEnabled,
        )
      : updateLiveFeedbackEnabledForAllQuestions(
          assessmentIds,
          liveFeedbackEnabled,
        );

  const handleLiveFeedbackUpdate = (liveFeedbackEnabled: boolean): void => {
    setIsLiveFeedbackUpdating(true);
    updateLiveFeedbackEnabled(liveFeedbackEnabled)
      .then(() => {
        dispatch(
          updateProgrammingQuestionLiveFeedbackEnabledForAssessments({
            liveFeedbackEnabled,
            assessmentIds,
          }),
        );
        toast.success(
          t(translations.successfulUpdateAllLiveFeedbackEnabled, {
            liveFeedbackEnabled,
          }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.errorOccurredWhenUpdatingLiveFeedbackSettings),
        );
      })
      .finally(() => {
        setLiveFeedbackSettingsConfirmation(false);
        setIsLiveFeedbackUpdating(false);
      });
  };

  return (
    <div>
      <div>
        <Switch
          checked={
            hasNoProgrammingQuestions || !isCourseCodaveriEnabled
              ? false
              : qnsWithLiveFeedbackEnabled.length ===
                programmingQuestions.length
          }
          color="primary"
          disabled={
            hasNoProgrammingQuestions ||
            !isCourseCodaveriEnabled ||
            isLiveFeedbackUpdating
          }
          onChange={(_, isChecked): void => {
            setLiveFeedbackChecked(isChecked);
            setLiveFeedbackSettingsConfirmation(true);
          }}
        />
        {!isSpecificAssessment && (
          <CodaveriSettingsChip
            assessmentIds={assessmentIds}
            for="live_feedback"
          />
        )}
      </div>

      <Prompt
        disabled={isLiveFeedbackUpdating}
        onClickPrimary={() => handleLiveFeedbackUpdate(isLiveFeedbackChecked)}
        onClose={() => setLiveFeedbackSettingsConfirmation(false)}
        open={liveFeedbackSettingsConfirmation}
        primaryColor="info"
        primaryLabel={t(translations.enableDisableButton, {
          enabled: isLiveFeedbackChecked,
        })}
        title={t(translations.enableDisableLiveFeedback, {
          enabled: isLiveFeedbackChecked,
          title,
          questionCount: programmingQuestions.length,
        })}
      />
    </div>
  );
};

export default LiveFeedbackToggleButton;
