import { ComponentProps } from 'react';
import { Link as MuiLink, Typography } from '@mui/material';

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

  if (!props.href && !props.onClick)
    return (
      <Typography component="span" variant={props.variant ?? 'body2'}>
        {props.children}
      </Typography>
    );

  return (
    <MuiLink
      color="links"
      variant="body2"
      {...linkProps}
      {...(opensInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      className={`cursor-pointer ${
        underlineOnHover && 'no-underline hover?:underline'
      } ${props.className}`}
    />
  );
};

export default Link;
