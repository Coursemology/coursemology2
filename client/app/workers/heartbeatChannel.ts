import { createConsumer, Subscription } from '@rails/actioncable';
import {
  FlushedActionData,
  HeartbeatPostData,
  NextActionData,
} from 'types/channels/heartbeat';

interface HeartbeatChannelCallbacks {
  resetInterval: (action: () => void, interval: number) => void;
  onPulse?: (heartbeat: HeartbeatPostData) => void;
  onPulsed?: (timestamp: number) => void;
  getHeartbeatData: () => HeartbeatPostData;
  getFlushData?: () => Promise<HeartbeatPostData[]>;
  onFlushed?: (from: number, to: number) => void;
  onTerminate?: () => void;
}

export interface HeartbeatChannel {
  unsubscribe: () => void;
}

const HEARTBEAT_CHANNEL_NAME = 'Course::Monitoring::HeartbeatChannel' as const;

const flushThenPulseOn = async (
  channel: Subscription,
  callbacks: HeartbeatChannelCallbacks,
): Promise<void> => {
  const flushData = await callbacks.getFlushData?.();
  if (flushData?.length) channel.perform('flush', { heartbeats: flushData });

  const heartbeat = callbacks.getHeartbeatData();

  callbacks.onPulse?.(heartbeat);
  channel.perform('pulse', heartbeat);
};

const subscribe = (
  url: string,
  sessionId: number,
  courseId: number,
  callbacks: HeartbeatChannelCallbacks,
): HeartbeatChannel => {
  // @rails/actioncable internally uses `document`, which is not available in a worker.
  // Passing a string URL to `createConsumer` ensures that it will not try to access
  // the Action Cable path and configuration from the DOM `meta` tags via `document`.
  // However, this is a workaround, and may no longer work if their codes change.
  const consumer = createConsumer(url);

  let channel: Subscription;

  const pulse = (): Promise<void> => flushThenPulseOn(channel, callbacks);

  const receivers = {
    next: (data: NextActionData): void => {
      callbacks.resetInterval(pulse, data.nextTimeout);
      callbacks.onPulsed?.(data.received);
    },
    flushed: (data: FlushedActionData): void => {
      callbacks.onFlushed?.(data.from, data.to);
    },
    terminate: (): void => {
      callbacks.onTerminate?.();
    },
  };

  let subscribed = false;

  channel = consumer.subscriptions.create(
    {
      channel: HEARTBEAT_CHANNEL_NAME,
      session_id: sessionId,
      course_id: courseId,
    },
    {
      connected: () => {
        pulse();
        subscribed = true;
      },
      received: (data) => {
        const action = data?.action;
        const receiver = action && receivers[action];
        if (!receiver) throw new Error(`Received unassigned action: ${action}`);

        receiver(data);
      },
      rejected: callbacks.onTerminate,
    },
  );

  return {
    unsubscribe: () => subscribed && channel.unsubscribe(),
  };
};

export default subscribe;
