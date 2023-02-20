import { KeyboardEventHandler, useRef, useState } from 'react';
import useEmitterFactory, { Emits } from 'react-emitter-factory';
import { Add } from '@mui/icons-material';
import { Button, Collapse } from '@mui/material';
import { EmailData } from 'types/users';

import TextField from 'lib/components/core/fields/TextField';
import Subsection from 'lib/components/core/layouts/Subsection';
import { formatErrorMessage } from 'lib/components/form/fields/utils/mapError';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

export interface AddEmailSubsectionEmitter {
  reset?: () => void;
}

interface AddEmailSubsectionProps extends Emits<AddEmailSubsectionEmitter> {
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
  const [expanded, setExpanded] = useState(false);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const resetField = (): void => {
    setEmail('');
    setError('');
  };

  const expandAndFocusField = (): void => {
    setExpanded((wasExpanded) => !wasExpanded);
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

  useEmitterFactory(props, { reset: resetField });

  return (
    <div className="!mt-10 space-y-5">
      <Collapse collapsedSize={0} in={expanded}>
        <Subsection spaced title={t(translations.addAnotherEmail)}>
          <TextField
            ref={emailInputRef}
            error={Boolean(error)}
            fullWidth
            helperText={formatErrorMessage(error)}
            inputProps={{ autoComplete: 'off' }}
            label={t(translations.emailAddress)}
            name="newEmail"
            onChange={(e): void => setEmail(e.target.value)}
            onKeyUp={handleKeyUp}
            placeholder={t(translations.emailAddressPlaceholder)}
            trims
            type="email"
            value={email}
            variant="filled"
          />
        </Subsection>
      </Collapse>

      <Button
        disabled={(expanded && email === '') || props.disabled}
        onClick={handleClickAddEmail}
        size="small"
        startIcon={<Add />}
        variant="outlined"
      >
        {t(translations.addEmailAddress)}
      </Button>
    </div>
  );
};

export default AddEmailSubsection;
