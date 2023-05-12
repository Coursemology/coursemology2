import { ComponentProps } from 'react';
import { ArrowOutward } from '@mui/icons-material';
import { Link as MuiLink, Typography } from '@mui/material';

interface LinkProps extends ComponentProps<typeof MuiLink> {
  opensInNewTab?: boolean;
  external?: boolean;
}

const Link = (props: LinkProps): JSX.Element => {
  const { opensInNewTab, external, ...linkProps } = props;

  const children = (
    <>
      {props.children}
      {external && <ArrowOutward fontSize="inherit" />}
    </>
  );

  if (!props.href && !props.onClick)
    return (
      <Typography component="span" variant={props.variant ?? 'body2'}>
        {children}
      </Typography>
    );

  return (
    <MuiLink
      className="cursor-pointer"
      color="links"
      variant="body2"
      {...linkProps}
      {...(opensInNewTab && {
        target: '_blank',
        rel: 'noopener noreferrer',
      })}
    >
      {children}
    </MuiLink>
  );
};

export default Link;
