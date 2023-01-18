import { ComponentRef, useMemo, useRef, useState } from 'react';
import { Chip, Typography } from '@mui/material';
import { TimelineData } from 'types/course/referenceTimelines';

import useTranslation from 'lib/hooks/useTranslation';

import DayCalendar from '../../components/DayCalendar';
import SearchField from '../../components/SearchField';
import SubmitIndicator from '../../components/SubmitIndicator';
import TimelinesOverview from '../../components/TimelinesOverview';
import TimelinesStack from '../../components/TimelinesStack';
import { selectItems, selectTimelines, useAppSelector } from '../../store';
import translations from '../../translations';

import ItemsSidebar from './ItemsSidebar';

const DayView = (): JSX.Element => {
  const { t } = useTranslation();

  const timelines = useAppSelector(selectTimelines);
  const items = useAppSelector(selectItems);

  const calendarRef = useRef<ComponentRef<typeof DayCalendar>>(null);
  const contentsRef = useRef<HTMLDivElement>(null);

  const [filterKeyword, setFilterKeyword] = useState('');

  const [hiddenTimelineIds, setHiddenTimelineIds] = useState<
    Set<TimelineData['id']>
  >(new Set());

  const visibleTimelines = useMemo(() => {
    if (!hiddenTimelineIds.size) return timelines;

    return timelines.filter((timeline) => !hiddenTimelineIds.has(timeline.id));
  }, [hiddenTimelineIds, timelines]);

  const filteredItems = useMemo(() => {
    if (!filterKeyword) return items;

    return items.filter((item) =>
      item.title.toLowerCase().includes(filterKeyword.toLowerCase().trim()),
    );
  }, [filterKeyword, items]);

  return (
    <main className="relative flex h-full overflow-hidden">
      <DayCalendar
        ref={calendarRef}
        className="ml-[32rem] border-0 border-l border-solid border-neutral-200"
        onScroll={(offset): void => {
          if (contentsRef.current) contentsRef.current.scrollLeft = offset;
        }}
      />

      <SubmitIndicator className="absolute right-36 top-0 h-12" />

      <div className="pointer-events-none absolute top-0 left-0 flex h-full w-full flex-col">
        <section className="pointer-events-auto flex h-36 w-[32rem] shrink-0 flex-col justify-between pb-3 pr-3">
          <div className="flex items-center space-x-4">
            <Typography variant="h6">
              {t(translations.timelineDesigner)}
            </Typography>

            <Chip
              color="success"
              label={t(translations.beta)}
              size="small"
              variant="outlined"
            />
          </div>

          <SearchField
            onChangeKeyword={setFilterKeyword}
            placeholder={t(translations.searchItems)}
          />
        </section>

        <section className="pointer-events-auto flex overflow-scroll overscroll-contain border-0 border-t border-solid border-neutral-200 pb-28">
          <ItemsSidebar
            className="w-[32rem]"
            for={filteredItems}
            onRequestFocus={(index): void =>
              calendarRef.current?.scrollToItem(index)
            }
            within={visibleTimelines}
          />

          <aside
            ref={contentsRef}
            className="scrollbar-hidden ml-[1px] h-fit w-full overflow-x-scroll"
            onScroll={(e): void => {
              if (e.currentTarget.scrollLeft)
                calendarRef.current?.scrollTo(e.currentTarget.scrollLeft);
            }}
          >
            <TimelinesStack for={filteredItems} within={visibleTimelines} />
          </aside>
        </section>
      </div>

      <summary className="absolute left-0 bottom-0 z-40 w-full border-0 border-t border-solid border-neutral-200 bg-white">
        <TimelinesOverview
          for={timelines}
          hiding={hiddenTimelineIds}
          onChangeHiddenTimelineIds={setHiddenTimelineIds}
        />
      </summary>
    </main>
  );
};

export default DayView;
