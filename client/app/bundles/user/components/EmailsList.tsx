import { useState } from 'react';
import {
  Alert,
  Card,
  Chip,
  Divider,
  IconButton,
  Typography,
} from '@mui/material';
import { Delete } from '@mui/icons-material';

import { EmailData } from 'types/users';
import Link from 'lib/components/core/Link';
import Prompt from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';
import translations from '../translations';

interface EmailCardProps {
  emails: EmailData[];
  disabled?: boolean;
  onRemoveEmail?: (id: EmailData['id'], email: EmailData['email']) => void;
  onSetEmailAsPrimary?: (
    url: NonNullable<EmailData['setPrimaryUserEmailPath']>,
    email: EmailData['email'],
  ) => void;
  onResendConfirmationEmail?: (
    url: NonNullable<EmailData['confirmationEmailPath']>,
    email: EmailData['email'],
  ) => void;
}

const EmailsList = (props: EmailCardProps): JSX.Element => {
  const { t } = useTranslation();
  const [emailToRemove, setEmailToRemove] = useState<EmailData>();

  const removeEmail = (email: EmailData): void => {
    props.onRemoveEmail?.(email.id, email.email);
    setEmailToRemove(undefined);
  };

  const handleClickRemoveEmail = (email: EmailData): void => {
    if (email.isConfirmed) {
      setEmailToRemove(email);
    } else {
      removeEmail(email);
    }
  };

  return (
    <>
      <Card variant="outlined">
        {props.emails.map((email, index) => (
          <section key={email.id} className="hover:bg-neutral-100">
            <div className="flex flex-col px-5 py-2">
              <div className="flex min-h-[4rem] items-center justify-between space-x-4">
                <div className="flex space-x-4">
                  <Typography variant="body1" className="break-all">
                    {email.email}
                  </Typography>

                  {email.isPrimary && (
                    <Chip
                      size="small"
                      label={t(translations.primaryEmail)}
                      color="success"
                      className="select-none"
                    />
                  )}

                  {!email.isPrimary && email.isConfirmed && (
                    <Chip
                      size="small"
                      label="Confirmed"
                      color="success"
                      variant="outlined"
                      className="select-none"
                    />
                  )}

                  {!email.isConfirmed && (
                    <Chip
                      size="small"
                      label={t(translations.unconfirmedEmail)}
                      color="warning"
                      variant="outlined"
                      className="select-none"
                    />
                  )}
                </div>

                {!email.isPrimary && (
                  <IconButton
                    color="error"
                    className="!-mr-4"
                    onClick={(): void => handleClickRemoveEmail(email)}
                    disabled={props.disabled}
                  >
                    <Delete />
                  </IconButton>
                )}
              </div>

              <div className="mb-2 flex flex-col space-y-3">
                {email.isConfirmed && (
                  <Typography variant="body2" color="text.secondary">
                    {t(translations.emailCanLogIn)}
                  </Typography>
                )}

                {!email.isPrimary &&
                  email.isConfirmed &&
                  email.setPrimaryUserEmailPath && (
                    <Link
                      variant="body2"
                      color="links"
                      className="w-fit"
                      opensInNewTab
                      onClick={(): void =>
                        props.onSetEmailAsPrimary?.(
                          email.setPrimaryUserEmailPath!,
                          email.email,
                        )
                      }
                    >
                      {t(translations.setEmailAsPrimary)}
                    </Link>
                  )}

                {!email.isConfirmed && email.confirmationEmailPath && (
                  <Alert severity="warning">
                    {t(translations.emailMustConfirm)}

                    <br />

                    <Link
                      variant="body2"
                      color="links"
                      className="w-fit"
                      opensInNewTab
                      onClick={(): void =>
                        props.onResendConfirmationEmail?.(
                          email.confirmationEmailPath!,
                          email.email,
                        )
                      }
                    >
                      {t(translations.resendConfirmationEmail)}
                    </Link>
                  </Alert>
                )}
              </div>
            </div>

            {index < props.emails.length - 1 && <Divider />}
          </section>
        ))}
      </Card>

      {emailToRemove && (
        <Prompt
          open={Boolean(emailToRemove)}
          title={t(translations.removeEmailPromptTitle, {
            email: emailToRemove.email,
          })}
          onClose={(): void => setEmailToRemove(undefined)}
          primaryColor="error"
          primaryDisabled={props.disabled}
          primaryLabel={t(translations.removeEmail)}
          onClickPrimary={(): void => removeEmail(emailToRemove)}
        >
          {t(translations.removeEmailPromptMessage, {
            email: emailToRemove.email,
          })}
        </Prompt>
      )}
    </>
  );
};

export default EmailsList;
