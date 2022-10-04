import { CircularProgress } from '@mui/material';

interface LoadingIndicatorProps {
  size?: number;
  bare?: boolean;
  fit?: boolean;
  className?: string;
  containerClassName?: string;
}

const LoadingIndicator = (props: LoadingIndicatorProps): JSX.Element => {
  const indicator = (
    <CircularProgress
      size={!props.fit ? props.size ?? 60 : undefined}
      className={props.className}
      data-testid="CircularProgress"
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

export default LoadingIndicator;
