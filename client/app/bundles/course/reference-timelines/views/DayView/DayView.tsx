import { ComponentRef, useMemo, useRef, useState } from 'react';
import { Typography } from '@mui/material';
import { TimelineData } from 'types/course/referenceTimelines';

import BetaChip from 'lib/components/core/BetaChip';
import SearchField from 'lib/components/core/fields/SearchField';
import useItems from 'lib/hooks/items/useItems';
import { useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import DayCalendar from '../../components/DayCalendar';
import SubmitIndicator from '../../components/SubmitIndicator';
import TimelinesOverview from '../../components/TimelinesOverview';
import TimelinesStack from '../../components/TimelinesStack';
import { selectItems, selectTimelines } from '../../selectors';
import translations from '../../translations';

import ItemsSidebar from './ItemsSidebar';

const DayView = (): JSX.Element => {
  const { t } = useTranslation();

  const timelines = useAppSelector(selectTimelines);
  const items = useAppSelector(selectItems);

  const calendarRef = useRef<ComponentRef<typeof DayCalendar>>(null);
  const contentsRef = useRef<HTMLDivElement>(null);

  const { processedItems: filteredItems, handleSearch } = useItems(items, [
    'title',
  ]);

  const [hiddenTimelineIds, setHiddenTimelineIds] = useState<
    Set<TimelineData['id']>
  >(new Set());

  const visibleTimelines = useMemo(() => {
    if (!hiddenTimelineIds.size) return timelines;

    return timelines.filter((timeline) => !hiddenTimelineIds.has(timeline.id));
  }, [hiddenTimelineIds, timelines]);

  return (
    <main className="relative flex h-[calc(100vh_-_4rem)] overflow-hidden">
      <DayCalendar
        ref={calendarRef}
        className="ml-[32rem] border-0 border-l border-solid border-neutral-200"
        onScroll={(offset): void => {
          if (contentsRef.current) contentsRef.current.scrollLeft = offset;
        }}
      />

      <SubmitIndicator className="absolute right-36 top-0 h-12" />

      <div className="pointer-events-none absolute left-0 top-0 flex h-full w-full flex-col">
        <section className="pointer-events-auto flex h-36 w-[32rem] shrink-0 flex-col justify-between px-5 pb-5">
          <div className="flex items-center space-x-4">
            <Typography variant="h6">
              {t(translations.timelineDesigner)}
            </Typography>

            <BetaChip />
          </div>

          <SearchField
            onChangeKeyword={handleSearch}
            placeholder={t(translations.searchItems)}
          />
        </section>

        <section className="scrollbar-hidden pointer-events-auto flex h-full overflow-y-scroll overscroll-contain border-0 border-t border-solid border-neutral-200">
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
            className="ml-[1px] h-fit min-h-full w-full overflow-x-scroll pb-28"
            onScroll={(e): void => {
              if (e.currentTarget.scrollLeft)
                calendarRef.current?.scrollTo(e.currentTarget.scrollLeft);
            }}
          >
            <TimelinesStack for={filteredItems} within={visibleTimelines} />
          </aside>
        </section>
      </div>

      <summary className="absolute bottom-0 left-0 z-40 w-full border-0 border-t border-solid border-neutral-200 bg-white">
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
