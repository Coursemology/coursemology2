import { useState } from 'react';
import { DialogContentText, Typography } from '@mui/material';

import Prompt from 'lib/components/core/dialogs/Prompt';
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
      <DialogContentText>
        {t(translations.deleteCourseWarning)}
      </DialogContentText>

      {/* TODO: Find a way to more elegantly handle HTML markups in translations */}
      <Typography
        color="text.secondary"
        dangerouslySetInnerHTML={{
          __html: t(translations.pleaseTypeChallengeToConfirmDelete, {
            challenge: `<code>${challengeText}</code>`,
          }),
        }}
        variant="body1"
      />

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
