import { useState } from 'react';
import { Typography } from '@mui/material';
import { WatchGroup } from 'types/channels/liveMonitoring';
import { MonitoringRequestData } from 'types/course/assessment/monitoring';

import BetaChip from 'lib/components/core/BetaChip';
import ErrorCard from 'lib/components/core/ErrorCard';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import ActivityCenter from './components/ActivityCenter';
import ConnectionStatus from './components/ConnectionStatus';
import FilterAutocomplete from './components/FilterAutocomplete';
import SessionBlobLegend from './components/SessionBlobLegend';
import SessionsGrid from './components/SessionsGrid';
import useLiveMonitoringChannel from './hooks/useLiveMonitoringChannel';
import useMonitoring from './hooks/useMonitoring';

interface PulseGridProps {
  with: MonitoringRequestData;
}

const PulseGrid = (props: PulseGridProps): JSX.Element => {
  const { courseId, monitorId, title } = props.with;

  const { t } = useTranslation();
  const [userIds, setUserIds] = useState<number[]>([]);
  const [groups, setGroups] = useState<WatchGroup[]>([]);
  const [hasSecret, setHasSecret] = useState(false);
  const monitoring = useMonitoring();

  const [rejected, setRejected] = useState(false);

  const channel = useLiveMonitoringChannel(courseId, monitorId, {
    watch: (data) => {
      setUserIds(data.userIds);
      setGroups(data.groups);
      setHasSecret(data.monitor.hasSecret);
      monitoring.initialize(data.monitor, data.snapshots);
      monitoring.notifyConnectedAt(Date.now());
    },
    disconnected: () => {
      monitoring.notifyDisconnectedAt(Date.now());
    },
    pulse: ({ userId, snapshot }) => {
      monitoring.refresh(userId, snapshot);
    },
    viewed: monitoring.supplySelected,
    terminate: monitoring.terminate,
    rejected: () => setRejected(true),
  });

  if (rejected)
    return (
      <ErrorCard
        message={t(translations.cannotConnectToLiveMonitoringChannel)}
      />
    );

  return (
    <main className="flex h-full space-x-4">
      <aside className="w-full space-y-5">
        <div className="flex items-center space-x-4">
          <Typography variant="h6">{t(translations.pulsegrid)}</Typography>
          <BetaChip />
        </div>

        <FilterAutocomplete filters={groups} />

        <SessionBlobLegend hasSecret={hasSecret} />

        <SessionsGrid
          for={userIds}
          onClickSession={channel.getRecentHeartbeats}
        />
      </aside>

      <aside className="flex w-[30rem] flex-col space-y-5">
        <ConnectionStatus title={title} />
        <ActivityCenter />
      </aside>
    </main>
  );
};

export default PulseGrid;
