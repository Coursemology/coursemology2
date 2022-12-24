import { Button } from '@mui/material';
import { TimeOffset } from 'types/course/admin/course';

import Prompt, { PromptText } from 'lib/components/core/dialogs/Prompt';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface OffsetTimesPromptProps {
  disabled: boolean;
  initialDateTime: Date;
  updatedDateTime: Date;
  open: boolean;
  onClose: () => void;
  onSubmit: (timeOffset?: TimeOffset) => void;
}

const convertDateToNearestMinute = (date: Date): Date => {
  return new Date(Math.floor(date.getTime() / (1000 * 60)) * 1000 * 60);
};

const OffsetTimesPrompt = (props: OffsetTimesPromptProps): JSX.Element => {
  const { t } = useTranslation();
  const initialDateTimeRoundedToNearestMin = convertDateToNearestMinute(
    props.initialDateTime,
  );
  const updatedDateTimeRoundedToNearestMin = convertDateToNearestMinute(
    props.updatedDateTime,
  );
  const offsetForward =
    updatedDateTimeRoundedToNearestMin > initialDateTimeRoundedToNearestMin;
  const diffinMS = Math.abs(
    updatedDateTimeRoundedToNearestMin.getTime() -
      initialDateTimeRoundedToNearestMin.getTime(),
  );
  const daysDiff = Math.floor(diffinMS / 86400000);
  const hoursDiff = Math.floor((diffinMS % 86400000) / 3600000);
  const minsDiff = Math.floor(((diffinMS % 86400000) % 3600000) / 60000);

  const timeOffset: TimeOffset = {
    days: offsetForward ? daysDiff : -daysDiff,
    hours: offsetForward ? hoursDiff : -hoursDiff,
    minutes: offsetForward ? minsDiff : -minsDiff,
  };

  const submitButtonWithoutOffset = (
    <Button
      className="prompt-secondary-btn"
      disabled={props.disabled}
      onClick={(): void => props.onSubmit()}
    >
      {t(translations.offsetTimesPromptSecondaryAction)}
    </Button>
  );

  const submitButtonWithOffset = (
    <Button
      className="prompt-primary-btn"
      disabled={props.disabled}
      onClick={(): void => props.onSubmit(timeOffset)}
    >
      {t(translations.offsetTimesPromptPrimaryAction)}
    </Button>
  );

  return (
    <Prompt
      contentClassName="space-y-4"
      disabled={props.disabled}
      onClose={props.onClose}
      open={props.open}
      primary={submitButtonWithOffset}
      secondary={submitButtonWithoutOffset}
      title={t(translations.offsetTimesPromptTitle)}
    >
      <PromptText>
        {t(translations.offsetTimesPromptText, {
          backwardOrForward: offsetForward ? 'later' : 'earlier',
          days: daysDiff,
          hours: hoursDiff,
          mins: minsDiff,
        })}
      </PromptText>
    </Prompt>
  );
};

export default OffsetTimesPrompt;
