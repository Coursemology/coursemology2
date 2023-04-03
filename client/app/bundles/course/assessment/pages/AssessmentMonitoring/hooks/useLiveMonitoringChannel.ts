import { useCallback, useEffect, useRef } from 'react';
import { getWebSocketURL } from 'utilities/socket';

import subscribe, {
  LiveMonitoringChannel,
  LiveMonitoringChannelCallbacks,
} from './liveMonitoringChannel';

type UseLiveMonitoringChannelHook = Omit<LiveMonitoringChannel, 'unsubscribe'>;

const useLiveMonitoringChannel = (
  courseId: number,
  monitorId: number,
  callbacks: LiveMonitoringChannelCallbacks,
): UseLiveMonitoringChannelHook => {
  const channelRef = useRef<LiveMonitoringChannel>();

  useEffect(() => {
    if (channelRef.current) return undefined;

    const channel = subscribe(
      getWebSocketURL(),
      courseId,
      monitorId,
      callbacks,
    );

    channelRef.current = channel;

    return (): void => {
      channel.unsubscribe();
      channelRef.current = undefined;
    };
  }, [courseId, monitorId]);

  const getRecentHeartbeats = useCallback((sessionId: number): void => {
    channelRef.current?.getRecentHeartbeats(sessionId);
  }, []);

  return { getRecentHeartbeats };
};

export default useLiveMonitoringChannel;
