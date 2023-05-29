import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { AppBar, IconButton, Toolbar, Typography } from '@mui/material';

interface PageHeaderProps {
  title: NonNullable<ReactNode>;
  returnLink?: string;
  toolbars?: ReactNode;
  children?: ReactNode;
}

/**
 * @deprecated Pages should use `Page` and the `title` prop instead.
 */
const PageHeader = (props: PageHeaderProps): JSX.Element => {
  const { title, returnLink, toolbars, children } = props;
  const navigate = useNavigate();

  return (
    <AppBar
      className="border-only-b-neutral-200"
      color="transparent"
      elevation={0}
      position="static"
    >
      <Toolbar className="flex items-center justify-between px-8 py-4">
        <div className="flex min-h-[4rem] w-full items-center">
          {returnLink && (
            <IconButton
              data-testid="ArrowBackIconButton"
              edge="start"
              onClick={(): void => navigate(returnLink)}
            >
              <ArrowBack data-testid="ArrowBack" />
            </IconButton>
          )}

          <Typography className="line-clamp-2" color="inherit" variant="h5">
            {title}
          </Typography>
        </div>

        <div className="flex shrink-0 items-center">
          {children ?? toolbars ?? null}
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default PageHeader;
