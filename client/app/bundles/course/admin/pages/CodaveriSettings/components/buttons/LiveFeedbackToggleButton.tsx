import { FC, useState } from 'react';
import { Switch } from '@mui/material';
import { ProgrammingQuestion } from 'types/course/admin/codaveri';

import { updateProgrammingQuestionLiveFeedbackEnabledForAssessments } from 'course/admin/reducers/codaveriSettings';
import Prompt from 'lib/components/core/dialogs/Prompt';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { updateLiveFeedbackEnabledForAllQuestions } from '../../operations';
import translations from '../../translations';
import CodaveriSettingsChip from '../CodaveriSettingsChip';

interface LiveFeedbackToggleButtonProps {
  programmingQuestions: ProgrammingQuestion[];
  for?: string;
  type: 'course' | 'category' | 'tab' | 'assessment' | 'question';
  hideChipIndicator?: boolean;
}

const LiveFeedbackToggleButton: FC<LiveFeedbackToggleButtonProps> = (props) => {
  const { programmingQuestions, for: title, type, hideChipIndicator } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const programmingQuestionIds = programmingQuestions.map((qn) => qn.id);

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

  const handleLiveFeedbackUpdate = (liveFeedbackEnabled: boolean): void => {
    setIsLiveFeedbackUpdating(true);
    updateLiveFeedbackEnabledForAllQuestions(
      programmingQuestionIds,
      liveFeedbackEnabled,
    )
      .then(() => {
        dispatch(
          updateProgrammingQuestionLiveFeedbackEnabledForAssessments({
            liveFeedbackEnabled,
            programmingQuestionIds,
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

  const updateLiveFeedbackEnabled = (isChecked: boolean): void => {
    if (type === 'question') {
      handleLiveFeedbackUpdate(isChecked);
    } else {
      setLiveFeedbackSettingsConfirmation(true);
    }
  };

  return (
    <div>
      <div>
        <Switch
          checked={
            hasNoProgrammingQuestions
              ? false
              : qnsWithLiveFeedbackEnabled.length ===
                programmingQuestions.length
          }
          color="primary"
          disabled={hasNoProgrammingQuestions || isLiveFeedbackUpdating}
          onChange={(_, isChecked): void => {
            setLiveFeedbackChecked(isChecked);
            updateLiveFeedbackEnabled(isChecked);
          }}
        />
        {!hideChipIndicator && (
          <CodaveriSettingsChip
            for="live_feedback"
            questions={programmingQuestions}
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
          title: title ?? '',
          questionCount: programmingQuestions.length,
        })}
      />
    </div>
  );
};

export default LiveFeedbackToggleButton;
