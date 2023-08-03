import { FC, useEffect, useState } from 'react';
import { CircularProgress } from '@mui/material';

interface LoadingIndicatorProps {
  size?: number;
  bare?: boolean;
  fit?: boolean;
  className?: string;
  containerClassName?: string;
}

export const LOADING_INDICATOR_TEST_ID = 'CircularProgress';

const LoadingIndicator = (props: LoadingIndicatorProps): JSX.Element => {
  const indicator = (
    <CircularProgress
      className={props.className}
      data-testid={LOADING_INDICATOR_TEST_ID}
      size={!props.fit ? props.size ?? 60 : undefined}
    />
  );

  if (props.bare) return indicator;

  return (
    <div
      className={`mt-10 flex w-full justify-center ${props.containerClassName}`}
    >
      {indicator}
    </div>
  );
};

interface DelayedLoadingIndicatorProps extends LoadingIndicatorProps {
  delayedForMS: number;
}
const DelayedLoadingIndicator: FC<DelayedLoadingIndicatorProps> = (props) => {
  const { delayedForMS, ...otherProps } = props;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsVisible(true);
    }, delayedForMS);

    return () => clearTimeout(timeoutId);
  }, []);

  return isVisible ? <LoadingIndicator {...otherProps} /> : undefined;
};

export default Object.assign(LoadingIndicator, {
  Delayed: DelayedLoadingIndicator,
});
