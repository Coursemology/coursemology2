import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Preload from 'lib/components/wrappers/Preload';
import { useAppDispatch } from 'lib/hooks/store';

import DayView from './views/DayView';
import { LastSavedProvider } from './contexts';
import { fetchTimelines } from './operations';
import translations from './translations';

const TimelineDesigner = (): JSX.Element => {
  const dispatch = useAppDispatch();

  return (
    <LastSavedProvider>
      <Preload
        render={<LoadingIndicator />}
        while={(): Promise<void> => dispatch(fetchTimelines())}
      >
        <DayView />
      </Preload>
    </LastSavedProvider>
  );
};

const handle = translations.timelineDesigner;

export default Object.assign(TimelineDesigner, { handle });
