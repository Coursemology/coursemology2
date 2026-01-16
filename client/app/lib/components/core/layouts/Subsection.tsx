import { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface SubsectionProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
  contentClassName?: string;
  spaced?: boolean;
  id?: string;
  startIcon?: ReactNode;
}

const Subsection = (props: SubsectionProps): JSX.Element => (
  <div className={props.className ?? ''} id={props.id}>
    <div className="mb-4">
      {props.title && (
        <div className="flex items-center space-x-2">
          {props.startIcon && (
            <div className="flex-0 flex items-center">{props.startIcon}</div>
          )}
          <Typography color="text.primary">{props.title}</Typography>
        </div>
      )}

      {props.subtitle && (
        <Typography color="text.secondary" variant="body2">
          {props.subtitle}
        </Typography>
      )}
    </div>

    <div
      className={`${props.contentClassName ?? ''} ${
        props.spaced ? 'space-y-5' : ''
      }`}
    >
      {props.children}
    </div>
  </div>
);

export default Subsection;
