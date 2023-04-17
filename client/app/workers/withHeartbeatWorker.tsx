import { ComponentType, useEffect, useRef, useState } from 'react';

import { getCourseId } from 'lib/helpers/url-helpers';
import usePrompt from 'lib/hooks/router/usePrompt';

interface WrappedComponentProps {
  setSessionId?: (sessionId: number) => void;
}

interface WorkerPort {
  port: MessagePort;
  terminatePort: () => void;
}

const setUpWorker = (): WorkerPort => {
  const worker = new SharedWorker(
    new URL('workers/heartbeat.worker.ts', import.meta.url),
  );

  worker.port.start();

  return {
    port: worker.port,
    terminatePort: (): void => {
      worker.port.postMessage({ type: 'disconnect' });
      worker.port.close();
    },
  };
};

const withHeartbeatWorker = <P extends WrappedComponentProps>(
  Component: ComponentType<P>,
): ComponentType<P> => {
  if (!globalThis.SharedWorker) return Component;

  const WrappedComponent = (props: P): JSX.Element => {
    const portRef = useRef<MessagePort>();
    const [sessionId, setSessionId] = useState<number>();

    usePrompt(Boolean(sessionId));

    useEffect(() => {
      if (!sessionId || portRef.current) return undefined;

      const { port, terminatePort } = setUpWorker();
      portRef.current = port;

      const courseId = getCourseId();
      if (!courseId)
        throw new Error(`Encountered illegal course ID: ${courseId}`);

      port.postMessage({ type: 'start', payload: { sessionId, courseId } });

      const terminateWorker = (): void => {
        terminatePort();
        portRef.current = undefined;
      };

      window.addEventListener('beforeunload', terminateWorker);

      return () => {
        terminateWorker();
        window.removeEventListener('beforeunload', terminateWorker);
      };
    }, [sessionId]);

    return <Component {...props} setSessionId={setSessionId} />;
  };

  WrappedComponent.displayName = Component.displayName;

  return WrappedComponent;
};

export default withHeartbeatWorker;
