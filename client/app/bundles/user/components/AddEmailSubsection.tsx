import { KeyboardEventHandler, useState, useRef } from 'react';
import { Add } from '@mui/icons-material';
import { Button, Collapse } from '@mui/material';

import { EmailData } from 'types/users';
import Subsection from 'lib/components/core/layouts/Subsection';
import TextField from 'lib/components/core/fields/TextField';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useToggle from 'lib/hooks/useToggle';
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
  const [expanded, toggleExpanded] = useToggle();
  const emailInputRef = useRef<HTMLInputElement>(null);

  const resetField = (): void => {
    setEmail('');
    setError('');
  };

  const expandAndFocusField = (): void => {
    toggleExpanded();
    emailInputRef.current?.focus();
  };

  const submitField = (): void => {
    if (email === '') return;
    props.onClickAddEmail?.(email, resetField, setError);
  };

  const handleClickAddEmail = (): void => {
    if (!expanded) {
      expandAndFocusField();
    } else {
      submitField();
    }
  };

  const handleKeyUp: KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleClickAddEmail();
    }
  };

  return (
    <div className="!mt-10 space-y-5">
      <Collapse in={expanded} collapsedSize={0}>
        <Subsection title={t(translations.addAnotherEmail)} spaced>
          <TextField
            name="newEmail"
            ref={emailInputRef}
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
            placeholder={t(translations.emailAddressPlaceholder)}
          />
        </Subsection>
      </Collapse>

      <Button
        startIcon={<Add />}
        variant="outlined"
        size="small"
        disabled={(expanded && email === '') || props.disabled}
        onClick={handleClickAddEmail}
      >
        {t(translations.addEmailAddress)}
      </Button>
    </div>
  );
};

export default AddEmailSubsection;
