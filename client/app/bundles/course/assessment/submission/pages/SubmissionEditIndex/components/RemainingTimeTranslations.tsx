import { FC } from 'react';
import { FormattedMessage } from 'react-intl';

import translations from '../../../translations';

interface Props {
  remainingTime: number;
}

const RemainingTimeTranslations: FC<Props> = (props) => {
  const { remainingTime } = props;

  const hours = Math.floor(remainingTime / 1000 / 60 / 60) % 24;
  const minutes = Math.floor(remainingTime / 1000 / 60) % 60;
  const seconds = Math.floor(remainingTime / 1000) % 60;

  if (hours > 0 || minutes > 0 || seconds > 0) {
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

  return <div />;
};

export default RemainingTimeTranslations;
