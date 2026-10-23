import { FC, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { HourglassTop } from '@mui/icons-material';

import Banner from 'lib/components/core/layouts/Banner';
import useTranslation from 'lib/hooks/useTranslation';
import { formatHumanizedDuration } from 'lib/moment';

import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../../constants';
import translations from '../../translations';

interface Props {
  forceSubmitRemainingTime: number;
}

// Beyond a day away, the banner can sit on screen for weeks, so it is styled as a quiet notice:
// black on white, delineated with the site's default blue on the two edges that meet the page.
// Within the day, and once the deadline has passed, it keeps its original urgent styling.
const DISTANT_CLASS_NAME =
  'bg-white text-black border-only-b-info border-only-l-info';
const IMMINENT_CLASS_NAME = 'bg-red-700 text-white border-only-b-fuchsia-200';
const PAST_DEADLINE_CLASS_NAME =
  'bg-yellow-700 text-white border-only-b-fuchsia-200';

// The countdown is shown only while there is at least a whole second left to name. Below that
// formatHumanizedDuration has no unit to report, and the banner is a tick away from the finalising
// message anyway.
const MILLISECONDS_IN_A_SECOND = 1000;

// Above this, the deadline is far enough off that an alarm-coloured banner would be noise.
const DISTANT_DEADLINE_MS = 24 * 60 * 60 * 1000;

const TimeLimitBanner: FC<Props> = (props) => {
  const { forceSubmitRemainingTime } = props;
  const { t } = useTranslation();
  const intl = useIntl();

  const [currentRemainingTime, setCurrentRemainingTime] = useState(
    forceSubmitRemainingTime,
  );
  const [currentBufferTime, setCurrentBufferTime] = useState(
    forceSubmitRemainingTime + BUFFER_TIME_TO_FORCE_SUBMIT_MS,
  );

  useEffect(() => {
    // Anchor the server-provided duration to the local clock once per value, then count down.
    const forceSubmitAt = Date.now() + forceSubmitRemainingTime;
    const interval = setInterval(() => {
      const currentTime = new Date().getTime();
      const remainingSeconds = forceSubmitAt - currentTime;
      const remainingBufferSeconds =
        forceSubmitAt + BUFFER_TIME_TO_FORCE_SUBMIT_MS - currentTime;

      setCurrentRemainingTime(remainingSeconds);
      // Tracked from the start rather than only once past the deadline, so it is never read while
      // still holding its initial value.
      setCurrentBufferTime(remainingBufferSeconds);
    }, MILLISECONDS_IN_A_SECOND);

    return () => clearInterval(interval);
  }, [forceSubmitRemainingTime]);

  const isCountingDown = currentRemainingTime >= MILLISECONDS_IN_A_SECOND;
  const isDistant = currentRemainingTime > DISTANT_DEADLINE_MS;

  let message: string;
  let className: string;

  if (isCountingDown) {
    message = t(translations.remainingTime, {
      timeLimit: formatHumanizedDuration(intl, currentRemainingTime),
    });
    className = isDistant ? DISTANT_CLASS_NAME : IMMINENT_CLASS_NAME;
  } else if (currentBufferTime > 0) {
    message = t(translations.remainingBufferTime, {
      timeLimit: formatHumanizedDuration(intl, currentBufferTime),
    });
    className = PAST_DEADLINE_CLASS_NAME;
  } else {
    message = t(translations.timeIsUp);
    className = PAST_DEADLINE_CLASS_NAME;
  }

  return (
    <Banner
      className={`fixed top-0 right-0 z-dropdown ${className}`}
      // The other variants are white on a dark fill, where the icon should inherit the text colour.
      icon={<HourglassTop className={isDistant ? 'text-info' : undefined} />}
    >
      {message}
    </Banner>
  );
};

export default TimeLimitBanner;
