import { lazy, Suspense } from 'react';
import PropTypes from 'prop-types';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';

import { submissionShape } from '../../propTypes';

const ScribingCanvas = lazy(
  () => import(/* webpackChunkName: "ScribingCanvas" */ './ScribingCanvas'),
);

const ScribingToolbar = lazy(
  () => import(/* webpackChunkName: "ScribingToolbar" */ './ScribingToolbar'),
);

const ScribingViewComponent = (props) => {
  const { answerId, submission } = props;
  if (!answerId) return null;

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <div className="mb-4 items-center">
        {submission.canUpdate && (
          <ScribingToolbar key={`ScribingToolbar-${answerId}`} {...props} />
        )}

        <ScribingCanvas key={`ScribingCanvas-${answerId}`} {...props} />
      </div>
    </Suspense>
  );
};

ScribingViewComponent.propTypes = {
  answerId: PropTypes.number.isRequired,
  submission: submissionShape,
};

export default ScribingViewComponent;
