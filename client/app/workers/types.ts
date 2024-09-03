interface StartPayload {
  url: string;
  sessionId: number;
  courseId: number;
}

export interface HeartbeatWorkerListener {
  start: (payload: StartPayload) => void;
  disconnect: () => void;
}

export interface HeartbeatWorkerListenerHost {
  close: () => void;
}

interface HeartbeatWorkerMessage<T extends keyof HeartbeatWorkerListener> {
  type: T;
  payload?: Parameters<HeartbeatWorkerListener[T]>[0];
}

export interface HeartbeatWorker {
  postMessage: <T extends keyof HeartbeatWorkerListener>(
    message: HeartbeatWorkerMessage<T>,
  ) => void;
  terminate: () => void;
}
