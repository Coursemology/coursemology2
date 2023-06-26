import { ComponentProps } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { ArrowOutward } from '@mui/icons-material';
import { Link as MuiLink, Typography } from '@mui/material';

interface LinkProps extends ComponentProps<typeof MuiLink> {
  to?: string | null;
  opensInNewTab?: boolean;
  external?: boolean;
}

const Link = (props: LinkProps): JSX.Element => {
  const { opensInNewTab, external, to: route, ...linkProps } = props;

  const children = (
    <>
      {props.children}
      {external && <ArrowOutward fontSize="inherit" />}
    </>
  );

  if (!route && !props.href && !props.onClick)
    return (
      <Typography
        className={props.className}
        component="span"
        id={props.id}
        variant={props.variant ?? 'body2'}
      >
        {children}
      </Typography>
    );

  return (
    <MuiLink
      color="links"
      variant="body2"
      {...linkProps}
      className={`cursor-pointer ${props.className ?? ''}`}
      {...(opensInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
      {...(route && {
        component: ReactRouterLink,
        to: route,
      })}
    >
      {children}
    </MuiLink>
  );
};

export default Link;
