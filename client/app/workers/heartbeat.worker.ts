import { getWebSocketURL } from 'utilities/socket';

import subscribe, { HeartbeatChannel } from './heartbeatChannel';
import setUpDatabase, { MonitoringDBActions } from './monitoringDatabase';

interface StartPayload {
  sessionId: number;
  courseId: number;
}

interface HeartbeatWorkerListener {
  start: (payload: StartPayload) => void;
  disconnect: () => void;
}

let channel: HeartbeatChannel;
let storage: MonitoringDBActions | null;
let interval: NodeJS.Timer;

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

const listenersThrough = (port: MessagePort): HeartbeatWorkerListener => ({
  start: async (payload): Promise<void> => {
    const { sessionId, courseId } = payload;
    storage ??= await setUpDatabase();

    channel ??= subscribe(getWebSocketURL(), sessionId, courseId, {
      resetInterval,
      onPulse: storage?.cacheHeartbeat,
      onPulsed: (timestamp: number) => {
        storage?.updateLastSuccessfulPulse(timestamp);
        storage?.removeHeartbeat(timestamp);
      },
      getFlushData: storage?.getHeartbeats,
      onFlushed: storage?.removeHeartbeats,
      onTerminate: terminateWorker,
    });
  },

  disconnect: () => port.close(),
});

onconnect = ({ ports }: MessageEvent): void => {
  const port = ports[0];

  const listeners = listenersThrough(port);

  port.addEventListener('message', ({ data }: MessageEvent) => {
    const listener = listeners[data.type];
    if (!listener) throw new Error(`No listener for ${data.type}!`);

    listener(data.payload);
  });

  port.start();
};
