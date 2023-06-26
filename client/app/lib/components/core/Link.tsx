import { ComponentProps, forwardRef } from 'react';
import { Link as ReactRouterLink } from 'react-router-dom';
import { ArrowOutward } from '@mui/icons-material';
import { Link as MuiLink, Typography } from '@mui/material';

interface LinkProps extends ComponentProps<typeof MuiLink> {
  to?: string | null | boolean;
  reloads?: boolean;
  opensInNewTab?: boolean;
  external?: boolean;
}

type LinkRef = HTMLAnchorElement;

const Link = forwardRef<LinkRef, LinkProps>((props, ref): JSX.Element => {
  const { opensInNewTab, external, to: route, reloads, ...linkProps } = props;

  const children = (
    <>
      {props.children}
      {external && <ArrowOutward fontSize="inherit" />}
    </>
  );

  if (!route && !props.href && !props.onClick)
    return (
      <Typography
        ref={ref}
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
      ref={ref}
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
        reloadDocument: reloads,
      })}
    >
      {children}
    </MuiLink>
  );
});

Link.displayName = 'Link';

export default Link;
