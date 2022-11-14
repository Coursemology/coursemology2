import { ComponentProps } from 'react';
import { Link as MuiLink } from '@mui/material';

interface LinkProps extends ComponentProps<typeof MuiLink> {
  opensInNewTab?: boolean;
  underlinesOnHover?: boolean;
}

const Link = (props: LinkProps): JSX.Element => {
  const {
    opensInNewTab,
    underlinesOnHover: underlineOnHover,
    ...linkProps
  } = props;

  return (
    <MuiLink
      color="links"
      {...linkProps}
      {...(opensInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      className={`cursor-pointer ${
        underlineOnHover && 'no-underline hoverable:hover:underline'
      } ${props.className}`}
    />
  );
};

export default Link;
