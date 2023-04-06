import { createConsumer } from '@rails/actioncable';
import {
  HeartbeatDetail,
  PulseData,
  WatchData,
} from 'types/channels/liveMonitoring';

const LIVE_MONITORING_CHANNEL_NAME =
  'Course::Monitoring::LiveMonitoringChannel' as const;

export interface LiveMonitoringChannel {
  getRecentHeartbeats: (sessionId: number) => void;
  unsubscribe: () => void;
}

export interface LiveMonitoringChannelCallbacks {
  watch?: (data: WatchData) => void;
  pulse?: (data: PulseData) => void;
  terminate?: (userId: number) => void;
  viewed?: (heartbeats: HeartbeatDetail[]) => void;
  disconnected?: () => void;
  rejected?: () => void;
}

const subscribe = (
  url: string,
  courseId: number,
  monitorId: number,
  receivers: LiveMonitoringChannelCallbacks,
): LiveMonitoringChannel => {
  const consumer = createConsumer(url);

  const channel = consumer.subscriptions.create(
    {
      channel: LIVE_MONITORING_CHANNEL_NAME,
      course_id: courseId,
      monitor_id: monitorId,
    },
    {
      connected: () => {
        channel.perform('watch');
      },
      received: (data: { action; payload }) => {
        const action = data?.action;
        const receiver = action && receivers[action];
        if (!receiver) throw new Error(`Received unassigned action: ${action}`);

        receiver(data.payload);
      },
      disconnected: receivers.disconnected,
      rejected: receivers.rejected,
    },
  );

  return {
    getRecentHeartbeats: (sessionId) =>
      channel.perform('view', { session_id: sessionId }),

    unsubscribe: (): void => {
      channel.unsubscribe();
      consumer.disconnect();
    },
  };
};

export default subscribe;
