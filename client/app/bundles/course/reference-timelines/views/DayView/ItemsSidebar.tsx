import { Typography } from '@mui/material';
import {
  ItemWithTimeData,
  TimelineData,
} from 'types/course/referenceTimelines';

import useTranslation from 'lib/hooks/useTranslation';
import moment from 'lib/moment';

import translations from '../../translations';
import { getDaysFromSeconds } from '../../utils';

import TimelineSidebarItem from './TimelineSidebarItem';

interface ItemsSidebarProps {
  for: ItemWithTimeData[];
  within: TimelineData[];
  className?: string;
  onRequestFocus?: (index: number) => void;
}

const ItemsSidebar = (props: ItemsSidebarProps): JSX.Element => {
  const { for: items, within: timelines } = props;
  const { t } = useTranslation();

  return (
    <aside className={`h-fit shrink-0 ${props.className ?? ''}`}>
      {items.map((item) => (
        <section
          key={item.id}
          className="flex border-0 border-b border-solid border-neutral-200"
        >
          <div
            className={`w-1/2 border-0 border-r border-solid border-neutral-200 ${
              timelines.length <= 1 ? 'flex items-center' : 'py-2'
            } pl-5 pr-2`}
          >
            <Typography
              className={
                timelines.length <= 1 ? 'line-clamp-1' : 'line-clamp-2'
              }
              variant="body2"
            >
              {item.title ?? t(translations.defaultTimeline)}
            </Typography>
          </div>

          <div className="flex w-1/2 flex-col">
            {timelines.map((timeline) => {
              const assignedTime = item.times[timeline.id];

              return (
                <TimelineSidebarItem
                  key={timeline.id}
                  assigned={Boolean(assignedTime)}
                  for={timeline}
                  onClick={(): void => {
                    const index = getDaysFromSeconds(
                      moment(assignedTime.startAt).unix(),
                    );

                    props.onRequestFocus?.(index);
                  }}
                />
              );
            })}
          </div>
        </section>
      ))}
    </aside>
  );
};

export default ItemsSidebar;
