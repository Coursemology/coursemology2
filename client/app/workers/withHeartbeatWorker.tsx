import { ComponentType, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getIdFromUnknown } from 'utilities';
import { getWebSocketURL } from 'utilities/socket';

import usePrompt from 'lib/hooks/router/usePrompt';

import { getWorkerType, setUpWorker } from './constructors';
import { HeartbeatWorker } from './types';

interface WrappedComponentProps {
  setSessionId?: (sessionId: number) => void;
}

const withHeartbeatWorker = <P extends WrappedComponentProps>(
  Component: ComponentType<P>,
): ComponentType<P> => {
  const workerType = getWorkerType();
  if (!workerType) return Component;

  const WrappedComponent = (props: P): JSX.Element => {
    const workerRef = useRef<HeartbeatWorker>();
    const [sessionId, setSessionId] = useState<number>();

    const params = useParams();
    const courseId = getIdFromUnknown(params.courseId);
    if (!courseId) throw new Error(`Illegal course ID: ${courseId}`);

    usePrompt(Boolean(sessionId));

    useEffect(() => {
      if (!sessionId || workerRef.current) return undefined;

      const worker = setUpWorker(workerType);
      workerRef.current = worker;

      worker.postMessage({
        type: 'start',
        payload: { url: getWebSocketURL(), sessionId, courseId },
      });

      const terminateWorker = (): void => {
        worker.terminate();
        workerRef.current = undefined;
      };

      window.addEventListener('beforeunload', terminateWorker);

      return () => {
        window.removeEventListener('beforeunload', terminateWorker);
      };
    }, [sessionId]);
    return <Component {...props} setSessionId={setSessionId} />;
  };

  WrappedComponent.displayName = Component.displayName;

  return WrappedComponent;
};

export default withHeartbeatWorker;
