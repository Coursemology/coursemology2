import { Typography } from '@mui/material';
import { ReactNode } from 'react';

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
        <Typography variant="body1" color="text.primary">
          {props.title}
        </Typography>
      )}

      {props.subtitle && (
        <Typography variant="body2" color="text.secondary">
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
