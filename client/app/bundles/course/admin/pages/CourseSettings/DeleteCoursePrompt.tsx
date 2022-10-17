import { DialogContentText, Typography } from '@mui/material';
import Prompt from 'lib/components/core/dialogs/Prompt';
import TextField from 'lib/components/core/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import { useState } from 'react';
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
      open={props.open}
      onClose={props.onClose}
      title={t(translations.deleteCoursePromptTitle, {
        title: props.courseTitle,
      })}
      primaryDisabled={props.disabled || inputChallenge !== challengeText}
      disabled={props.disabled}
      primaryLabel={t(translations.deleteCourse)}
      primaryColor="error"
      onClickPrimary={props.onConfirmDelete}
      contentClassName="space-y-4"
    >
      <DialogContentText>
        {t(translations.deleteCourseWarning)}
      </DialogContentText>

      {/* TODO: Find a way to more elegantly handle HTML markups in translations */}
      <Typography
        variant="body1"
        color="text.secondary"
        dangerouslySetInnerHTML={{
          __html: t(translations.pleaseTypeChallengeToConfirmDelete, {
            challenge: `<code>${challengeText}</code>`,
          }),
        }}
      />

      <TextField
        name="confirmDeleteField"
        value={inputChallenge}
        onChange={(e): void => setInputChallenge(e.target.value)}
        variant="filled"
        size="small"
        placeholder={t(translations.confirmDeletePlaceholder)}
        disabled={props.disabled}
        fullWidth
        hiddenLabel
      />
    </Prompt>
  );
};

export default DeleteCoursePrompt;
