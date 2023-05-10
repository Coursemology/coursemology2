import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import { Alert, AlertProps, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  contactCoursemology: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.contactCoursemology',
    defaultMessage: 'Contact Coursemology',
  },
  copyEmailBodyWithErrorMessage: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.copyEmailBodyWithErrorMessage',
    defaultMessage: 'Copy email body with error message',
  },
  emailSubject: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.emailSubject',
    defaultMessage: '[Bug Report] Evaluator Error',
  },
  emailBody: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.emailBody',
    defaultMessage:
      `Dear Coursemology Admin,{nl}{nl}` +
      `I encountered the following error when submitting my programming question code:{nl}{nl}` +
      `{message}{nl}{nl}` +
      `The page URL is: {url}`,
  },
  copiedEmailBodyToClipboard: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.copiedEmailBodyToClipboard',
    defaultMessage:
      'Copied email body to clipboard! Contact Coursemology admin at {email}.',
  },
  copyingEmailBodyToClipboard: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.copyingEmailBodyToClipboard',
    defaultMessage: 'Copying the email body to clipboard...',
  },
  errorCopyingEmailBodyToClipboard: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.errorCopyingEmailBodyToClipboard',
    defaultMessage:
      'An error occurred while copying the email body to clipboard.',
  },
});

const SUPPORT_EMAIL = 'coursemology@gmail.com' as const;

const getMailtoURL = (subject: string, body: string): string => {
  const encodedSubject = encodeURIComponent(subject);
  const encodedBody = encodeURIComponent(body);
  return `mailto:${SUPPORT_EMAIL}?subject=${encodedSubject}&body=${encodedBody}`;
};

interface EvaluatorErrorPanelProps extends AlertProps {
  children: string;
}

const EvaluatorErrorPanel = (props: EvaluatorErrorPanelProps): JSX.Element => {
  const { children: message } = props;

  const { t } = useTranslation();

  const url = window.location.href;
  const emailBody = t(translations.emailBody, { message, url, nl: '\n' });

  const emailURL = getMailtoURL(t(translations.emailSubject), emailBody);

  const copyEmailBodyToClipboard = (): Promise<void> =>
    toast.promise(navigator.clipboard.writeText(emailBody), {
      pending: t(translations.copyingEmailBodyToClipboard),
      error: t(translations.errorCopyingEmailBodyToClipboard),
      success: t(translations.copiedEmailBodyToClipboard, {
        email: SUPPORT_EMAIL,
      }),
    });

  return (
    <Alert {...props} classes={{ message: 'space-y-5' }} severity="error">
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

export default EvaluatorErrorPanel;
