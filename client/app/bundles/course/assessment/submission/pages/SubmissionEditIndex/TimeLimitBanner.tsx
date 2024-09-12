import { FC, useEffect, useState } from 'react';
import { HourglassTop } from '@mui/icons-material';
import { Typography } from '@mui/material';

import Banner from 'lib/components/core/layouts/Banner';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../../constants';
import { getAssessment } from '../../selectors/assessments';
import { getSubmission } from '../../selectors/submissions';
import translations from '../../translations';

import RemainingTimeTranslations from './components/RemainingTimeTranslations';

const TimeLimitBanner: FC = () => {
  const { t } = useTranslation();

  const assessment = useAppSelector(getAssessment);
  const submission = useAppSelector(getSubmission);

  const initialCurrentTime = new Date().getTime();
  const hasSubmissionTimeLimit =
    assessment.timeLimit &&
    submission.workflowState === 'attempting' &&
    submission.timerStartedAt;

  const submissionTimeLimitAt = hasSubmissionTimeLimit
    ? new Date(submission.timerStartedAt).getTime() +
      assessment.timeLimit! * 60 * 1000
    : null;

  const initialRemainingTime = submissionTimeLimitAt
    ? submissionTimeLimitAt - initialCurrentTime
    : assessment.timeLimit! * 60 * 1000;

  const [currentRemainingTime, setCurrentRemainingTime] =
    useState(initialRemainingTime);
  const [currentBufferTime, setCurrentBufferTime] = useState(
    initialRemainingTime + BUFFER_TIME_TO_FORCE_SUBMIT_MS,
  );

  useEffect(() => {
    if (submissionTimeLimitAt) {
      const interval = setInterval(() => {
        const currentTime = new Date().getTime();
        const remainingSeconds = submissionTimeLimitAt - currentTime;
        const remainingBufferSeconds =
          submissionTimeLimitAt + BUFFER_TIME_TO_FORCE_SUBMIT_MS - currentTime;

        setCurrentRemainingTime(remainingSeconds);

        if (remainingSeconds < 0) {
          setCurrentBufferTime(remainingBufferSeconds);
        }
      }, 1000);

      return () => clearInterval(interval);
    }

    return () => {};
  }, [submissionTimeLimitAt]);

  if (currentRemainingTime <= 0) {
    return (
      <Banner
        className="bg-yellow-700 text-white border-only-b-fuchsia-200 fixed top-0 right-0"
        icon={<HourglassTop />}
      >
        {currentBufferTime > 0 ? (
          <Typography variant="body2">
            {t(translations.remainingBufferTime, {
              timeLimit: (
                <RemainingTimeTranslations remainingTime={currentBufferTime} />
              ),
            })}
          </Typography>
        ) : (
          <Typography variant="body2">{t(translations.timeIsUp)}</Typography>
        )}
      </Banner>
    );
  }

  return (
    <Banner
      className="bg-red-700 text-white border-only-b-fuchsia-200 fixed top-0 right-0"
      icon={<HourglassTop />}
    >
      <Typography variant="body2">
        {t(translations.remainingTime, {
          timeLimit: (
            <RemainingTimeTranslations remainingTime={currentRemainingTime} />
          ),
        })}
      </Typography>
    </Banner>
  );
};

export default TimeLimitBanner;
