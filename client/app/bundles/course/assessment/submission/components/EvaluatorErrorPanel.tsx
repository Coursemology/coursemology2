import { defineMessages } from 'react-intl';
import { AlertProps } from '@mui/material';

import ContactableErrorAlert from 'lib/components/core/layouts/ContactableErrorAlert';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  emailSubject: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.emailSubject',
    defaultMessage: '[Bug Report] Evaluator Error',
  },
  emailBody: {
    id: 'course.assessment.submission.EvaluatorErrorPanel.emailBody',
    defaultMessage:
      'Dear Coursemology Admin,{nl}{nl}' +
      'I encountered the following error when submitting my programming question code:{nl}{nl}' +
      '{message}{nl}{nl}' +
      'The page URL is: {url}',
  },
});

const SUPPORT_EMAIL = 'coursemology@gmail.com' as const;

interface EvaluatorErrorPanelProps extends AlertProps {
  children: string;
  className?: string;
}

const EvaluatorErrorPanel = (props: EvaluatorErrorPanelProps): JSX.Element => {
  const { children: message } = props;

  const { t } = useTranslation();

  const url = window.location.href;
  const emailBody = t(translations.emailBody, { message, url, nl: '\n' });

  return (
    <ContactableErrorAlert
      className={props.className}
      emailBody={emailBody}
      emailSubject={t(translations.emailSubject)}
      supportEmail={SUPPORT_EMAIL}
    >
      {message}
    </ContactableErrorAlert>
  );
};

export default EvaluatorErrorPanel;
