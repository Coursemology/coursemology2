import { ComponentType, memo } from 'react';
import { East } from '@mui/icons-material';

import McqIllustration from './McqIllustration';
import MrqIllustration from './MrqIllustration';

type Illustration = typeof McqIllustration | typeof MrqIllustration;

export interface IllustrationProps {
  className?: string;
}

const ConvertMcqMrqIllustration = (
  FromIllustration: Illustration,
  ToIllustration: Illustration,
): ComponentType<IllustrationProps> => {
  const component = (props: IllustrationProps): JSX.Element => (
    <div className={`flex items-center space-x-4 ${props.className ?? ''}`}>
      <FromIllustration />

      <East className="text-yellow-500" />

      <div className="rounded-xl bg-neutral-100 p-4">
        <ToIllustration />
      </div>
    </div>
  );

  component.displayName = 'ConvertMcqMrqIllustration';

  return component;
};

export default {
  ToMrq: memo(ConvertMcqMrqIllustration(McqIllustration, MrqIllustration)),
  ToMcq: memo(ConvertMcqMrqIllustration(MrqIllustration, McqIllustration)),
};
