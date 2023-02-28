import { ComponentType, memo } from 'react';
import { Checkbox, Radio, Skeleton } from '@mui/material';

interface OptionSkeletonProps {
  checked?: boolean;
}

const OptionSkeleton = (
  Component: typeof Radio | typeof Checkbox,
): ComponentType<OptionSkeletonProps> => {
  const component = (props: OptionSkeletonProps): JSX.Element => (
    <div className="pointer-events-none flex items-center">
      <Component checked={props.checked} className="py-0 pl-0" size="small" />
      <Skeleton animation={false} className="h-10 w-32" />
    </div>
  );

  component.displayName = 'OptionSkeleton';

  return component;
};

export default {
  Choice: memo(OptionSkeleton(Radio)),
  Response: memo(OptionSkeleton(Checkbox)),
};
