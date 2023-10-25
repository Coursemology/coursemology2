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

  return {
    getHeartbeats: useCallback((sessionId, limit?) => {
      channelRef.current?.getHeartbeats(sessionId, limit);
    }, []),
  };
};

export default useLiveMonitoringChannel;
