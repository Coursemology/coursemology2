import { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface SubsectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  spaced?: boolean;
}

const Subsection = (props: SubsectionProps): JSX.Element => (
  <div className={props.className}>
    <div className="mb-4">
      {props.title && (
        <Typography color="text.primary" variant="body1">
          {props.title}
        </Typography>
      )}

      {props.subtitle && (
        <Typography color="text.secondary" variant="body2">
          {props.subtitle}
        </Typography>
      )}
    </div>

    <div className={`${props.contentClassName} ${props.spaced && 'space-y-5'}`}>
      {props.children}
    </div>
  </div>
);

export default Subsection;
