import { ReactNode } from 'react';
import { Grow, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';

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
      <Link to={url} underline="hover">
        {crumbText}
      </Link>
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
