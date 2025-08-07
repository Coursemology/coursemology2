import { ComponentType, ReactNode, Suspense } from 'react';
import { Await, useLoaderData } from 'react-router-dom';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';

const ScholaisticAsyncContainer = ({
  children,
}: {
  children: ReactNode;
}): JSX.Element => {
  const data = useLoaderData() as { promise: Promise<unknown> };

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <Await errorElement={<p>oopsie</p>} resolve={data.promise}>
        {children}
      </Await>
    </Suspense>
  );
};

export const withScholaisticAsyncContainer = (
  Component: ComponentType,
): ComponentType => {
  const WrappedComponent: ComponentType = (props) => (
    <ScholaisticAsyncContainer>
      <Component {...props} />
    </ScholaisticAsyncContainer>
  );

  WrappedComponent.displayName = `withScholaisticAsyncContainer(${Component.displayName || Component.name})`;

  return WrappedComponent;
};
