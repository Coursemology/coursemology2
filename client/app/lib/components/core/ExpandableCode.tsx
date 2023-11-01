import { ComponentProps } from 'react';
import { Typography } from '@mui/material';

import Expandable from 'lib/components/core/Expandable';

const DEFAULT_COLLAPSED_HEIGHT_PX = 40;

type ExpandableProps = ComponentProps<typeof Expandable>;

type ExpandableCodeProps = Omit<ExpandableProps, 'over'> & {
  over?: ExpandableProps['over'];
};

const ExpandableCode = (props: ExpandableCodeProps): JSX.Element => {
  const { children, over, ...expandableProps } = props;

  return (
    <Expandable {...expandableProps} over={over ?? DEFAULT_COLLAPSED_HEIGHT_PX}>
      <Typography className="whitespace-pre-wrap h-full break-all font-mono text-[1.3rem]">
        {children}
      </Typography>
    </Expandable>
  );
};

export default ExpandableCode;
