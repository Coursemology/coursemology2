import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Dangerous } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import { Typography } from '@mui/material';
import { BlockedByMonitorAssessmentData } from 'types/course/assessment/assessments';

import TextField from 'lib/components/core/fields/TextField';
import Page from 'lib/components/core/layouts/Page';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { unblockAssessment } from '../operations/assessments';
import translations from '../translations';

interface AssessmentBlockedByMonitorPageProps {
  for: BlockedByMonitorAssessmentData;
}

const AssessmentBlockedByMonitorPage = (
  props: AssessmentBlockedByMonitorPageProps,
): JSX.Element => {
  const { for: assessment } = props;

  const { t } = useTranslation();

  const [sessionPassword, setSessionPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errored, setErrored] = useState(false);

  const navigate = useNavigate();

  const handleOverrideAccess = (): void => {
    if (!sessionPassword) return;

    setErrored(false);
    setSubmitting(true);

    unblockAssessment(assessment.id, sessionPassword)
      .then(() => navigate(0))
      .catch((error) => {
        toast.error(error ?? 'oopsie');
        setErrored(true);
        setSubmitting(false);
      });
  };

  return (
    <Page className="h-full m-auto flex flex-col items-center justify-center text-center">
      <Dangerous className="text-[6rem]" color="error" />

      <Typography className="mt-5" variant="h6">
        {t(translations.invalidBrowser)}
      </Typography>

      <Typography
        className="max-w-3xl mt-2"
        color="text.secondary"
        variant="body2"
      >
        {t(translations.invalidBrowserSubtitle)}
      </Typography>

      <section className="mt-10 w-full max-w-lg flex flex-col space-y-5">
        <TextField
          autoFocus
          className={errored ? 'animate-shake' : undefined}
          disabled={submitting}
          error={errored}
          fullWidth
          label={t(translations.sessionUnlockPassword)}
          name="email"
          onChange={(e): void => setSessionPassword(e.target.value)}
          onPressEnter={handleOverrideAccess}
          trims
          type="password"
          value={sessionPassword}
          variant="filled"
        />

        <LoadingButton
          disabled={!sessionPassword}
          loading={submitting}
          onClick={handleOverrideAccess}
          variant="contained"
        >
          {t(translations.overrideAccess)}
        </LoadingButton>

        <Typography color="text.secondary" variant="caption">
          {t(translations.accessGrantedForThisSessionOnly)}
        </Typography>
      </section>
    </Page>
  );
};

export default AssessmentBlockedByMonitorPage;
