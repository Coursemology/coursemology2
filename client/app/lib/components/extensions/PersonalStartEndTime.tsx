import { defineMessages } from 'react-intl';
import { AccessTime, Lock } from '@mui/icons-material';
import { Typography } from '@mui/material';

import CustomTooltip from 'lib/components/core/CustomTooltip';
import useTranslation from 'lib/hooks/useTranslation';
import { formatMiniDateTime } from 'lib/moment';

interface Props {
  timeInfo?: {
    isFixed: boolean;
    effectiveTime?: string | null;
    referenceTime?: string | null;
  };
  className?: string;
}

const translations = defineMessages({
  timeTooltip: {
    id: 'lib.components.extensions.personalStartEndTime.timeTooltip',
    defaultMessage:
      'Personalized time is in effect. The original time is {time}.',
  },
  lockTooltip: {
    id: 'lib.components.extensions.personalStartEndTime.lockTooltip',
    defaultMessage:
      'The timeline for this is fixed and will not be automatically modified.',
  },
});

/**
 * Displays the effective and reference time differences in a personalized timeline.
 */
const PersonalStartEndTime = (props: Props): JSX.Element => {
  const { t } = useTranslation();

  const { timeInfo, className } = props;
  if (!timeInfo?.effectiveTime) return <div>-</div>;

  return (
    <div className="flex items-center">
      <Typography className={className ?? ''} variant="body2">
        {formatMiniDateTime(timeInfo.effectiveTime)}
      </Typography>

      <div className="ml-2 flex items-center space-x-1">
        {timeInfo.isFixed && (
          <CustomTooltip arrow title={t(translations.lockTooltip)}>
            <Lock className="text-neutral-500" fontSize="small" />
          </CustomTooltip>
        )}

        {timeInfo.effectiveTime !== timeInfo.referenceTime &&
          timeInfo.referenceTime && (
            <CustomTooltip
              arrow
              title={t(translations.timeTooltip, {
                time: formatMiniDateTime(timeInfo.referenceTime),
              })}
            >
              <AccessTime className="text-neutral-500" fontSize="small" />
            </CustomTooltip>
          )}
      </div>
    </div>
  );
};
export default PersonalStartEndTime;
