import subscribe, { HeartbeatChannel } from './heartbeatChannel';
import setUpDatabase, { MonitoringDBActions } from './monitoringDatabase';
import type {
  HeartbeatWorkerListener,
  HeartbeatWorkerListenerHost,
} from './types';

let channel: HeartbeatChannel;
let storage: MonitoringDBActions | null;
let interval: NodeJS.Timeout;

const resetInterval = (callback: () => void, timeout: number): void => {
  if (interval) clearInterval(interval);
  interval = setInterval(callback, timeout);
};

const terminateWorker = async (): Promise<void> => {
  clearInterval(interval);
  channel.unsubscribe();
  await storage?.destroy();
  globalThis.close();
};

const createListeners = (
  host: HeartbeatWorkerListenerHost,
): HeartbeatWorkerListener => ({
  start: async ({ url, sessionId, courseId, sebPayload }): Promise<void> => {
    storage ??= await setUpDatabase();

    channel ??= subscribe(url, sessionId, courseId, {
      resetInterval,
      onPulse: storage?.cacheHeartbeat,
      onPulsed: (timestamp: number) => {
        storage?.updateLastSuccessfulPulse(timestamp);
        storage?.removeHeartbeat(timestamp);
      },
      getHeartbeatData: () => ({ timestamp: Date.now(), sebPayload }),
      getFlushData: storage?.getHeartbeats,
      onFlushed: storage?.removeHeartbeats,
      onTerminate: terminateWorker,
    });
  },

  disconnect: () => host.close(),
});

export default createListeners;
