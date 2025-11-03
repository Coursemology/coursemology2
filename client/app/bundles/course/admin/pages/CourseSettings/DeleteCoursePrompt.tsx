import { useState } from 'react';
import { Typography } from '@mui/material';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

const DEFAULT_CHALLENGE = 'coursemology';

interface DeleteCoursePromptProps {
  courseTitle: string;
  open?: boolean;
  onClose?: () => void;
  onConfirmDelete?: () => void;
  disabled: boolean;
}

const DeleteCoursePrompt = (props: DeleteCoursePromptProps): JSX.Element => {
  const challengeText = DEFAULT_CHALLENGE;

  const { t } = useTranslation();
  const [inputChallenge, setInputChallenge] = useState('');

  return (
    <Prompt
      contentClassName="space-y-4"
      disabled={props.disabled}
      onClickPrimary={props.onConfirmDelete}
      onClose={props.onClose}
      open={props.open}
      primaryColor="error"
      primaryDisabled={props.disabled || inputChallenge !== challengeText}
      primaryLabel={t(translations.deleteCourse)}
      title={t(translations.deleteCoursePromptTitle, {
        title: props.courseTitle,
      })}
    >
      <PromptText>{t(translations.deleteCourseWarning)}</PromptText>

      <Typography color="text.secondary">
        {t(translations.pleaseTypeChallengeToConfirmDelete, {
          challenge: <code>{challengeText}</code>,
        })}
      </Typography>

      <TextField
        disabled={props.disabled}
        fullWidth
        hiddenLabel
        name="confirmDeleteField"
        onChange={(e): void => setInputChallenge(e.target.value)}
        placeholder={t(translations.confirmDeletePlaceholder)}
        size="small"
        value={inputChallenge}
        variant="filled"
      />
    </Prompt>
  );
};

export default DeleteCoursePrompt;
