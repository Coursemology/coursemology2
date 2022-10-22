import { ComponentProps } from 'react';
import { Link as MuiLink } from '@mui/material';

interface LinkProps extends ComponentProps<typeof MuiLink> {
  opensInNewTab?: boolean;
}

const Link = (props: LinkProps): JSX.Element => {
  const { opensInNewTab, ...linkProps } = props;

  return (
    <MuiLink
      {...linkProps}
      {...(opensInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      className={`cursor-pointer ${props.className}`}
    />
  );
};

export default Link;
