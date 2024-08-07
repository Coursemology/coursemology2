import { FC, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { HourglassTop } from '@mui/icons-material';

import Banner from 'lib/components/core/layouts/Banner';

import { BUFFER_TIME_TO_FORCE_SUBMIT_MS } from '../../constants';
import translations from '../../translations';

interface Props {
  submissionTimeLimitAt: number;
}

export const remainingTimeDisplay = (remainingTime: number): JSX.Element => {
  const hours = Math.floor(remainingTime / 1000 / 60 / 60) % 24;
  const minutes = Math.floor(remainingTime / 1000 / 60) % 60;
  const seconds = Math.floor(remainingTime / 1000) % 60;

  if (hours > 0) {
    return (
      <FormattedMessage
        {...translations.hoursMinutesSeconds}
        values={{
          hrs: hours,
          mins: minutes,
          secs: seconds,
        }}
      />
    );
  }

  if (minutes > 0) {
    return (
      <FormattedMessage
        {...translations.minutesSeconds}
        values={{
          mins: minutes,
          secs: seconds,
        }}
      />
    );
  }

  if (seconds >= 0) {
    return (
      <FormattedMessage
        {...translations.seconds}
        values={{
          secs: seconds,
        }}
      />
    );
  }

  return <div />;
};

const TimeLimitBanner: FC<Props> = (props) => {
  const { submissionTimeLimitAt } = props;
  const initialCurrentTime = new Date().getTime();
  const initialRemainingTime = submissionTimeLimitAt - initialCurrentTime;

  const [currentRemainingTime, setCurrentRemainingTime] =
    useState(initialRemainingTime);
  const [currentBufferTime, setCurrentBufferTime] = useState(
    initialRemainingTime + BUFFER_TIME_TO_FORCE_SUBMIT_MS,
  );

  useEffect(() => {
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
  }, [submissionTimeLimitAt]);

  let TimeBanner: JSX.Element;

  if (currentRemainingTime > 0) {
    TimeBanner = (
      <Banner
        className="bg-red-700 text-white border-only-b-fuchsia-200 fixed top-0 right-0"
        icon={<HourglassTop />}
      >
        <FormattedMessage
          {...translations.remainingTime}
          values={{ timeLimit: remainingTimeDisplay(currentRemainingTime) }}
        />
      </Banner>
    );
  } else {
    TimeBanner = (
      <Banner
        className="bg-yellow-700 text-white border-only-b-fuchsia-200 fixed top-0 right-0"
        icon={<HourglassTop />}
      >
        {currentBufferTime > 0 ? (
          <FormattedMessage
            {...translations.remainingBufferTime}
            values={{ timeLimit: remainingTimeDisplay(currentBufferTime) }}
          />
        ) : (
          <FormattedMessage {...translations.timeIsUp} />
        )}
      </Banner>
    );
  }

  return TimeBanner;
};

export default TimeLimitBanner;
