import { HeartbeatWorker } from './types';

const workerConstructors = {
  dedicated: (): HeartbeatWorker => {
    const worker = new Worker(
      new URL('workers/heartbeat.worker.ts', import.meta.url),
    );

    return {
      postMessage: (message) => worker.postMessage(message),
      terminate: (): void => {
        worker.postMessage({ type: 'disconnect' });
        worker.terminate();
      },
    };
  },
  shared: (): HeartbeatWorker => {
    const worker = new SharedWorker(
      new URL('workers/heartbeat.sharedworker.ts', import.meta.url),
    );

    worker.port.start();

    return {
      postMessage: (message) => worker.port.postMessage(message),
      terminate: (): void => {
        worker.port.postMessage({ type: 'disconnect' });
        worker.port.close();
      },
    };
  },
} satisfies Record<string, () => HeartbeatWorker>;

type WorkerType = keyof typeof workerConstructors;

export const getWorkerType = (): WorkerType | null => {
  if (globalThis.SharedWorker) return 'shared';
  if (globalThis.Worker) return 'dedicated';

  return null;
};

export const setUpWorker = (type: WorkerType): HeartbeatWorker => {
  const constructor = workerConstructors[type];
  if (!constructor) throw new Error(`No constructor for ${type}!`);

  return workerConstructors[type]();
};
