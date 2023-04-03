import { InfoOutlined, Link, LinkOff } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';

import Subsection from 'lib/components/core/layouts/Subsection';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { formatPreciseTime } from 'lib/moment';

import translations from '../../../translations';
import useMonitoring from '../hooks/useMonitoring';
import { select } from '../selectors';
import { Activity } from '../types';

interface ActivityCenterProps {
  className?: string;
}

const ACTIVITY_ICONS: Record<Activity['type'], JSX.Element> = {
  missing: <LinkOff className="text-red-500" />,
  alive: <Link className="text-green-400" />,
  info: <InfoOutlined className="text-sky-400" />,
} as const;

const ActivityCenter = (props: ActivityCenterProps): JSX.Element => {
  const { t } = useTranslation();
  const history = useAppSelector(select('history'));
  const monitoring = useMonitoring();

  const activities: JSX.Element[] = [];

  for (let index = history.length - 1; index >= 0; index--) {
    const activity = history[index];

    activities.push(
      <div
        key={index}
        className={`flex animate-flash space-x-3 border border-b border-b-neutral-200 px-5 py-3 hover:bg-neutral-100 ${
          activity.type === 'missing' ? 'slot-1-red-200' : ''
        } ${activity.type === 'alive' ? 'slot-1-green-200' : ''}`}
        onMouseEnter={
          activity.userId
            ? (): void => monitoring.select(activity.userId!)
            : undefined
        }
        onMouseLeave={activity.userId ? monitoring.deselect : undefined}
      >
        {ACTIVITY_ICONS[activity.type]}

        <div>
          <Typography variant="body2">{activity.message}</Typography>

          <Typography color="text.secondary" variant="caption">
            {formatPreciseTime(activity.timestamp)}
          </Typography>
        </div>
      </div>,
    );
  }

  return (
    <Paper className={`h-full p-5 ${props.className ?? ''}`} variant="outlined">
      <Subsection
        className="flex h-full flex-col"
        contentClassName="h-full overflow-y-auto -mx-5 -mb-5"
        subtitle={t(translations.recentActivitiesHint)}
        title={t(translations.recentActivities)}
      >
        {activities}
      </Subsection>
    </Paper>
  );
};

export default ActivityCenter;
