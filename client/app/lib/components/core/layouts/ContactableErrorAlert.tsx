import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { Alert, AlertProps, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  contactCoursemology: {
    id: 'lib.components.core.layouts.ContactableErrorAlert.contactCoursemology',
    defaultMessage: 'Contact Coursemology',
  },
  copyEmailBodyWithErrorMessage: {
    id: 'lib.components.core.layouts.ContactableErrorAlert.copyEmailBodyWithErrorMessage',
    defaultMessage: 'Copy email body with error message',
  },
  copiedEmailBodyToClipboard: {
    id: 'lib.components.core.layouts.ContactableErrorAlert.copiedEmailBodyToClipboard',
    defaultMessage:
      'Copied email body to clipboard! Contact Coursemology admin at {email}.',
  },
  copyingEmailBodyToClipboard: {
    id: 'lib.components.core.layouts.ContactableErrorAlert.copyingEmailBodyToClipboard',
    defaultMessage: 'Copying the email body to clipboard...',
  },
  errorCopyingEmailBodyToClipboard: {
    id: 'lib.components.core.layouts.ContactableErrorAlert.errorCopyingEmailBodyToClipboard',
    defaultMessage:
      'An error occurred while copying the email body to clipboard.',
  },
});

const getMailtoURL = (email: string, subject: string, body: string): string => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${email}?subject=${encodedSubject}&body=${encodedBody}`;
};

interface ContactableErrorAlertProps extends AlertProps {
  children: string;
  supportEmail: string;
  emailBody: string;
  emailSubject: string;
}

const ContactableErrorAlert = (
  props: ContactableErrorAlertProps,
): JSX.Element => {
  const {
    children: message,
    emailBody,
    emailSubject,
    supportEmail,
    ...otherProps
  } = props;

  const { t } = useTranslation();

  const emailURL = getMailtoURL(supportEmail, emailSubject, emailBody);

  const copyEmailBodyToClipboard = (): Promise<void> =>
    toast.promise(navigator.clipboard.writeText(emailBody), {
      pending: t(translations.copyingEmailBodyToClipboard),
      error: t(translations.errorCopyingEmailBodyToClipboard),
      success: t(translations.copiedEmailBodyToClipboard, {
        email: supportEmail,
      }),
    });

  return (
    <Alert {...otherProps} classes={{ message: 'space-y-5' }} severity="error">
      <Typography className="break-words" variant="body2">
        {message}
      </Typography>

      <div className="flex flex-col space-y-3 md:flex-row md:space-x-5 md:space-y-0">
        <Link external href={emailURL}>
          {t(translations.contactCoursemology)}
        </Link>

        <Link onClick={copyEmailBodyToClipboard}>
          {t(translations.copyEmailBodyWithErrorMessage)}
        </Link>
      </div>
    </Alert>
  );
};

export default ContactableErrorAlert;
