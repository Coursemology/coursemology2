import { KeyboardEventHandler, useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';

import { EmailData } from 'types/users';
import Subsection from 'lib/components/core/layouts/Subsection';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';
import translations from '../translations';

interface AddEmailSubsectionProps {
  disabled?: boolean;
  onClickAddEmail?: (
    email: EmailData['email'],
    onSuccess: () => void,
    onError: (message: string) => void,
  ) => void;
}

const AddEmailSubsection = (props: AddEmailSubsectionProps): JSX.Element => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleClickAddEmail = (): void => {
    if (email === '') return;

    props.onClickAddEmail?.(
      email,
      () => {
        setEmail('');
        setError('');
      },
      setError,
    );
  };

  const handleKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClickAddEmail();
    }
  };

  return (
    <Subsection
      title={t(translations.addAnotherEmail)}
      className="!mt-10"
      spaced
    >
      <TextField
        label={t(translations.emailAddress)}
        type="email"
        value={email}
        onChange={(e): void => setEmail(e.target.value)}
        onKeyUp={handleKeyUp}
        variant="filled"
        fullWidth
        trims
        inputProps={{ autoComplete: 'off' }}
        error={Boolean(error)}
        helperText={formatErrorMessage(error)}
      />

      <Button
        startIcon={<Add />}
        variant="outlined"
        size="small"
        disabled={email === '' || props.disabled}
        onClick={handleClickAddEmail}
      >
        {t(translations.addEmailAddress)}
      </Button>
    </Subsection>
  );
};

export default AddEmailSubsection;
