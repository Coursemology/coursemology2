import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { produce } from 'immer';
import { TimelineData } from 'types/course/referenceTimelines';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';
import CreateRenameTimelinePrompt from '../CreateRenameTimelinePrompt';

import TimelinesOverviewItem from './TimelinesOverviewItem';

type TimelineIdsSet = Set<TimelineData['id']>;

interface TimelinesOverviewProps {
  for: TimelineData[];
  hiding?: TimelineIdsSet;
  onChangeHiddenTimelineIds?: (
    transform: (hiddenTimelineIds: TimelineIdsSet) => TimelineIdsSet,
  ) => void;
}

const TimelinesOverview = (props: TimelinesOverviewProps): JSX.Element => {
  const { for: timelines, hiding: hiddenTimelineIds } = props;

  const { t } = useTranslation();

  const [creating, setCreating] = useState(false);

  return (
    <div className="relative min-h-[6rem] px-5 py-4">
      <aside className="scrollbar-hidden flex items-start space-x-4 overflow-x-scroll pr-56">
        {timelines.map((timeline) => (
          <TimelinesOverviewItem
            key={timeline.id}
            checked={!hiddenTimelineIds?.has(timeline.id)}
            for={timeline}
            onChangeCheck={(checked): void => {
              if (checked) {
                props.onChangeHiddenTimelineIds?.((oldHiddenTimelineIds) =>
                  produce(oldHiddenTimelineIds, (draft) => {
                    draft.delete(timeline.id);
                  }),
                );
              } else {
                props.onChangeHiddenTimelineIds?.((oldHiddenTimelineIds) =>
                  produce(oldHiddenTimelineIds, (draft) => {
                    draft.add(timeline.id);
                  }),
                );
              }
            }}
          />
        ))}
      </aside>

      <aside className="absolute right-0 top-0 flex h-full items-center pl-20 pr-5 bg-fade-to-l-white">
        <Button
          onClick={(): void => setCreating(true)}
          size="small"
          startIcon={<Add />}
          variant="outlined"
        >
          {t(translations.addTimeline)}
        </Button>
      </aside>

      <CreateRenameTimelinePrompt
        onClose={(): void => setCreating(false)}
        open={creating}
      />
    </div>
  );
};

export default TimelinesOverview;
