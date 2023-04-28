import {
  HeartbeatDetail,
  MonitoringMonitorData,
  Snapshot,
  Snapshots,
} from 'types/channels/liveMonitoring';

import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { monitoringActions as actions } from '../../../reducers/monitoring';
import translations from '../../../translations';

interface UseMonitoringHook {
  initialize: (monitor: MonitoringMonitorData, snapshots: Snapshots) => void;
  notifyConnectedAt: (timestamp: number) => void;
  notifyDisconnectedAt: (timestamp: number) => void;
  notifyMissingAt: (timestamp: number, userId: number, name: string) => void;
  notifyAliveAt: (timestamp: number, userId: number, name: string) => void;
  refresh: (userId: number, data: Partial<Snapshot>) => void;
  terminate: (userId: number) => void;
  supplySelected: (heartbeats: HeartbeatDetail[]) => void;
  select: (userId: number) => void;
  deselect: () => void;
  filter: (userIds?: number[]) => void;
}

const useMonitoring = (): UseMonitoringHook => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  return {
    initialize: (monitor, snapshots): void => {
      dispatch(actions.initialize({ monitor, snapshots }));
    },
    refresh: (userId, data): void => {
      dispatch(actions.refresh({ userId, data }));
    },
    terminate: (userId): void => {
      dispatch(actions.terminate(userId));
    },
    supplySelected: (heartbeats): void => {
      dispatch(actions.supplySelectedSnapshot(heartbeats));
    },
    select: (userId): void => {
      dispatch(actions.selectSnapshot(userId));
    },
    deselect: (): void => {
      dispatch(actions.deselectSnapshot());
    },
    filter: (userIds): void => {
      dispatch(actions.filter(userIds));
    },
    notifyConnectedAt: (timestamp): void => {
      dispatch(actions.setConnected(true));

      dispatch(
        actions.pushHistory({
          message: t(translations.connectedToLiveMonitoringChannel),
          type: 'info',
          timestamp,
        }),
      );
    },
    notifyDisconnectedAt: (timestamp): void => {
      dispatch(actions.setConnected(false));

      dispatch(
        actions.pushHistory({
          message: t(translations.disconnectedFromLiveMonitoringChannel),
          type: 'info',
          timestamp,
        }),
      );
    },
    notifyMissingAt: (timestamp, userId, name): void => {
      dispatch(
        actions.pushHistory({
          userId,
          message: t(translations.userHeartbeatNotReceivedInTime, { name }),
          type: 'missing',
          timestamp,
        }),
      );
    },
    notifyAliveAt: (timestamp, userId, name): void => {
      dispatch(
        actions.pushHistory({
          userId,
          message: t(translations.userHeartbeatContinuedStreaming, { name }),
          type: 'alive',
          timestamp,
        }),
      );
    },
  };
};

export default useMonitoring;
