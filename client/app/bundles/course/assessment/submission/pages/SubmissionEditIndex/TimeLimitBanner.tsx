import { FC, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { HourglassTop } from '@mui/icons-material';

import Banner from 'lib/components/core/layouts/Banner';

import translations from '../../translations';

interface Props {
  deadline: Date;
}

const remainingTimeDisplay = (remainingTime: number): JSX.Element | null => {
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

  return null;
};

const TimeLimitBanner: FC<Props> = (props) => {
  const { deadline } = props;
  const initialRemainingTime =
    new Date(deadline).getTime() - new Date().getTime();

  const [currentRemainingTime, setCurrentRemainingTime] =
    useState(initialRemainingTime);
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTime = new Date();
      const remainingSeconds =
        new Date(deadline).getTime() - currentTime.getTime();

      setCurrentRemainingTime(remainingSeconds);
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  return (
    <Banner
      className="bg-red-700 text-white border-only-b-fuchsia-200 fixed top-0 right-0"
      icon={<HourglassTop />}
    >
      {currentRemainingTime > 0 ? (
        <FormattedMessage
          {...translations.remainingTime}
          values={{ timeLimit: remainingTimeDisplay(currentRemainingTime) }}
        />
      ) : (
        <FormattedMessage {...translations.timeIsUp} />
      )}
    </Banner>
  );
};

export default TimeLimitBanner;
