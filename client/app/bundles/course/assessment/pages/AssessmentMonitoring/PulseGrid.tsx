import { useState } from 'react';
import { Typography } from '@mui/material';
import { WatchGroup } from 'types/channels/liveMonitoring';
import { MonitoringRequestData } from 'types/course/assessment/monitoring';

import BetaChip from 'lib/components/core/BetaChip';
import Page from 'lib/components/core/layouts/Page';
import Note from 'lib/components/core/Note';
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
  const [validates, setValidates] = useState(false);
  const monitoring = useMonitoring();

  const [rejected, setRejected] = useState(false);

  const channel = useLiveMonitoringChannel(courseId, monitorId, {
    watch: (data) => {
      setUserIds(data.userIds);
      setGroups(data.groups);
      setValidates(data.monitor.validates);
      monitoring.initialize(data.monitor, data.snapshots);
      monitoring.notifyConnected();
    },
    disconnected: () => {
      monitoring.notifyDisconnected();
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
      <Note
        message={t(translations.cannotConnectToLiveMonitoringChannel)}
        severity="error"
      />
    );

  return (
    <Page className="flex h-full space-x-4 pt-0">
      <aside className="w-full space-y-5">
        <div className="flex items-center space-x-4">
          <Typography variant="h6">{t(translations.pulsegrid)}</Typography>
          <BetaChip />
        </div>

        <FilterAutocomplete filters={groups} />

        <SessionBlobLegend validates={validates} />

        <SessionsGrid for={userIds} getHeartbeats={channel.getHeartbeats} />
      </aside>

      <aside className="flex w-[30rem] flex-col space-y-5">
        <ConnectionStatus title={title} />
        <ActivityCenter />
      </aside>
    </Page>
  );
};

export default PulseGrid;
