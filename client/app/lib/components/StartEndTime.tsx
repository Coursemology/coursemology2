import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { styled, Tooltip, tooltipClasses, TooltipProps } from '@mui/material';
import { AccessTime, Lock } from '@mui/icons-material';
import { getFullDateTime } from 'lib/helpers/timehelper';

interface Props extends WrappedComponentProps {
  timeInfo: {
    isFixed: boolean;
    effectiveTime: string;
    referenceTime: string;
  };
}

const translations = defineMessages({
  timeTooltip: {
    id: 'startEndTime.timeTooltip',
    defaultMessage: 'Personalized time is in effect. The original time is',
  },
  altTimeTooltip: {
    id: 'startEndTime.altTimeTooltip',
    defaultMessage:
      'Personalized time is in effect. There is no original deadline.',
  },
  lockTooltip: {
    id: 'startEndTime.lockTooltip',
    defaultMessage:
      'The timeline for this is locked and will not be automatically modified',
  },
});

// Copied from MUI website to have custom tooltip width / colour
const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow classes={{ popper: className }} />
))({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500,
  },
});

/*
This component is meant for displaying effective and reference time differences
when a personalized timeline is in use. For an example, you can make use of the courses 
home page.
*/
const StartEndTime: FC<Props> = (props) => {
  const { intl, timeInfo } = props;
  // Dont leave the space blank
  if (timeInfo.effectiveTime === null) {
    return <div>-</div>;
  }
  return (
    <div style={{ display: 'flex' }}>
      <div>{getFullDateTime(timeInfo.effectiveTime)}</div>
      <div style={{ marginLeft: 5, marginBottom: -6 }}>
        {timeInfo.isFixed && (
          <CustomTooltip
            title={intl.formatMessage(translations.lockTooltip)}
            arrow
            placement="top"
          >
            <Lock fontSize="small" />
          </CustomTooltip>
        )}
      </div>

      {timeInfo.effectiveTime !== timeInfo.referenceTime && (
        <div style={{ marginLeft: 0, marginBottom: -6 }}>
          <CustomTooltip
            title={
              timeInfo.referenceTime
                ? `${intl.formatMessage(translations.timeTooltip)} ${
                    timeInfo.referenceTime
                  }`
                : intl.formatMessage(translations.altTimeTooltip)
            }
            arrow
            placement="top"
          >
            <AccessTime fontSize="small" />
          </CustomTooltip>
        </div>
      )}
    </div>
  );
};
export default injectIntl(StartEndTime);
