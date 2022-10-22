import { Card, Chip, Divider, IconButton, Typography } from '@mui/material';
import { Delete } from '@mui/icons-material';

import { EmailData } from 'types/users';
import Link from 'lib/components/core/Link';
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

  const handleClickRemoveEmail = (email: EmailData): void => {
    // if email is not confirmed, just delete
    // if email is not primary, warn
    // if email is primary, warn + option to set as primary
    // if email is last, throw new Error
    props.onRemoveEmail?.(email.id, email.email);
  };

  return (
    <Card variant="outlined">
      {props.emails.map((email, index) => (
        <section key={email.id} className="hover:bg-neutral-100">
          <div className="flex flex-col px-5 py-2">
            <div className="flex items-center justify-between space-x-4">
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

                {!email.isConfirmed && (
                  <Chip
                    size="small"
                    label={t(translations.unconfirmedEmail)}
                    color="warning"
                    className="select-none"
                  />
                )}
              </div>

              <IconButton
                color="error"
                className="!-mr-4"
                onClick={(): void => handleClickRemoveEmail(email)}
                disabled={props.disabled}
              >
                <Delete />
              </IconButton>
            </div>

            {!email.isConfirmed && email.confirmationEmailPath && (
              <Link
                variant="body2"
                color="links"
                className="mb-2"
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
            )}

            {!email.isPrimary &&
              email.isConfirmed &&
              email.setPrimaryUserEmailPath && (
                <Link
                  variant="body2"
                  color="links"
                  className="mb-2"
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
          </div>

          {index < props.emails.length - 1 && <Divider />}
        </section>
      ))}
    </Card>
  );
};

export default EmailsList;
