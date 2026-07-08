import { lazy, Suspense, useRef } from 'react';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import { ScribingCanvasRef } from './ScribingCanvas';

const ScribingCanvas = lazy(
  () => import(/* webpackChunkName: "ScribingCanvas" */ './ScribingCanvas'),
);

const ScribingToolbar = lazy(
  () => import(/* webpackChunkName: "ScribingToolbar" */ './ScribingToolbar'),
);

interface Props {
  answerId: number;
  submission: { canUpdate: boolean };
}

const ScribingViewComponent = ({
  answerId,
  submission,
}: Props): JSX.Element | null => {
  const canvasRef = useRef<ScribingCanvasRef>(null);

  if (!answerId) return null;

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <div className="mb-4 w-full items-center">
        {submission.canUpdate && (
          <ScribingToolbar
            key={`ScribingToolbar-${answerId}`}
            answerId={answerId}
            canvasRef={canvasRef.current}
          />
        )}
        <ScribingCanvas
          key={`ScribingCanvas-${answerId}`}
          ref={canvasRef}
          answerId={answerId}
        />
      </div>
    </Suspense>
  );
};

export default ScribingViewComponent;
