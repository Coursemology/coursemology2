import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Grow, Typography } from '@mui/material';

interface CrumbProps {
  children: ReactNode;
  to?: string | false;
}

const Crumb = (props: CrumbProps): JSX.Element => {
  const { to: url, children: title } = props;

  const crumbText = (
    <Typography className="whitespace-nowrap" variant="body2">
      {title}
    </Typography>
  );

  return (
    <Grow key={title?.toString()} in style={{ transformOrigin: 'center left' }}>
      {url ? <Link to={url}>{crumbText}</Link> : crumbText}
    </Grow>
  );
};

const CrumbSeparator = (): JSX.Element => (
  <Grow in style={{ transformOrigin: 'center left' }}>
    <Typography color="text.disabled" variant="body2">
      /
    </Typography>
  </Grow>
);

export default Object.assign(Crumb, { Separator: CrumbSeparator });
