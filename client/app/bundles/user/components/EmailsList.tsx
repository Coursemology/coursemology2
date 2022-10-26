import { useState } from 'react';
import {
  Card,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Delete,
  AccountCircle,
  Notifications,
  Warning,
} from '@mui/icons-material';

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

  const renderStatusBadge = (email: EmailData): JSX.Element => {
    if (email.isPrimary)
      return (
        <Chip
          size="small"
          label={t(translations.primaryEmail)}
          color="success"
          className="select-none"
        />
      );

    if (email.isConfirmed)
      return (
        <Chip
          size="small"
          label={t(translations.confirmedEmail)}
          color="success"
          variant="outlined"
          className="select-none"
        />
      );

    return (
      <Chip
        size="small"
        label={t(translations.unconfirmedEmail)}
        color="warning"
        variant="outlined"
        className="select-none"
      />
    );
  };

  const renderAbilityBadges = (email: EmailData): JSX.Element => (
    <>
      {email.isConfirmed && (
        <Tooltip title={t(translations.emailCanLogIn)}>
          <AccountCircle className="text-neutral-500" />
        </Tooltip>
      )}

      {email.isPrimary && (
        <Tooltip title={t(translations.emailReceivesNotifications)}>
          <Notifications className="text-neutral-500" />
        </Tooltip>
      )}
    </>
  );

  const renderActions = (email: EmailData): JSX.Element | null => {
    if (email.isPrimary) return null;

    const confirmationUrl = email.confirmationEmailPath;
    const setPrimaryUrl = email.setPrimaryUserEmailPath;

    const isConfirmable = !email.isConfirmed && Boolean(confirmationUrl);
    const canSetAsPrimary = email.isConfirmed && Boolean(setPrimaryUrl);

    return (
      <div className="mb-2 flex flex-col space-y-3">
        {canSetAsPrimary && (
          <Link
            variant="body2"
            color="links"
            className="w-fit"
            opensInNewTab
            onClick={(): void =>
              props.onSetEmailAsPrimary?.(setPrimaryUrl!, email.email)
            }
          >
            {t(translations.setEmailAsPrimary)}
          </Link>
        )}

        {isConfirmable && (
          <>
            <div className="flex items-center space-x-2 text-amber-600">
              <Warning fontSize="small" />

              <Typography variant="body2">
                {t(translations.emailMustConfirm)}
              </Typography>
            </div>

            <Link
              variant="body2"
              color="links"
              className="w-fit"
              opensInNewTab
              onClick={(): void =>
                props.onResendConfirmationEmail?.(confirmationUrl!, email.email)
              }
            >
              {t(translations.resendConfirmationEmail)}
            </Link>
          </>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="-mx-4 -mt-2 mb-4 flex flex-row flex-wrap hoverable:hidden">
        <div className="mx-4 my-2 flex items-center space-x-2 text-neutral-400">
          <AccountCircle />

          <Typography variant="body2">
            {t(translations.emailCanLogIn)}
          </Typography>
        </div>

        <div className="mx-4 my-2 flex items-center space-x-2 text-neutral-400">
          <Notifications />

          <Typography variant="body2">
            {t(translations.emailReceivesNotifications)}
          </Typography>
        </div>
      </div>

      <Card variant="outlined">
        {props.emails.map((email, index) => (
          <section key={email.id} className="hoverable:hover:bg-neutral-100">
            <div className="flex flex-col px-5 py-2">
              <div className="flex min-h-[4rem] items-center justify-between space-x-4">
                <div className="flex space-x-4">
                  <Typography variant="body1" className="break-all">
                    {email.email}
                  </Typography>

                  {renderStatusBadge(email)}

                  {renderAbilityBadges(email)}
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

              {renderActions(email)}
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
