import { ReactNode } from 'react';
import { Typography } from '@mui/material';

interface BannerProps {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
  actions?: ReactNode;
}

const Banner = (props: BannerProps): JSX.Element => {
  return (
    <div
      className={`flex flex-wrap items-center justify-between space-x-4 px-5 py-1 ${
        props.className ?? ''
      }`}
    >
      <div className="flex items-center space-x-4">
        {props.icon}

        <Typography variant="body2">{props.children}</Typography>
      </div>

      <div className="flex space-x-5">{props.actions}</div>
    </div>
  );
};

export default Banner;
