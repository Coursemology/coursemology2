import { ArrowForward, InfoOutlined } from '@mui/icons-material';
import { Tooltip, Typography } from '@mui/material';
import { TimelineData } from 'types/course/referenceTimelines';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface TimelineSidebarItemProps {
  for: TimelineData;
  assigned?: boolean;
  onClick?: () => void;
}

const TimelineSidebarItem = (props: TimelineSidebarItemProps): JSX.Element => {
  const { for: timeline, assigned } = props;

  const { t } = useTranslation();

  return (
    <div
      className={`group box-content flex h-10 items-center justify-between border-0 border-b border-solid border-neutral-200 px-2 last:border-b-0 ${
        !assigned
          ? 'bg-neutral-100 text-neutral-400'
          : 'text-neutral-500 hover?:bg-neutral-50'
      }`}
      {...(assigned && {
        role: 'button',
        onClick: props.onClick,
      })}
    >
      <Typography className="line-clamp-1" variant="body2">
        {timeline.title ?? t(translations.defaultTimeline)}
      </Typography>

      {assigned ? (
        <ArrowForward
          className="hoverable:invisible group-hover?:visible"
          color="primary"
          fontSize="small"
        />
      ) : (
        <Tooltip title={t(translations.hintNoTimeAssigned)}>
          <InfoOutlined fontSize="small" />
        </Tooltip>
      )}
    </div>
  );
};

export default TimelineSidebarItem;
