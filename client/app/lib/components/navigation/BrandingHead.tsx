import { ReactNode, useState } from 'react';
import { defineMessages } from 'react-intl';
import { AdminPanelSettingsOutlined, ChevronRight } from '@mui/icons-material';
import { Avatar, IconButton, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import PopupMenu from 'lib/components/core/PopupMenu';
import { useAppContext } from 'lib/containers/AppContainer';
import useTranslation from 'lib/hooks/useTranslation';

import UserPopupMenuList from './UserPopupMenuList';

const translations = defineMessages({
  coursemology: {
    id: 'app.BrandingItem.coursemology',
    defaultMessage: 'Coursemology',
  },
  adminPanel: {
    id: 'course.courses.BrandingItem.adminPanel',
    defaultMessage: 'System Admin Panel',
  },
  instanceAdminPanel: {
    id: 'course.courses.BrandingItem.instanceAdminPanel',
    defaultMessage: 'Instance Admin Panel',
  },
  superuser: {
    id: 'course.courses.BrandingItem.superuser',
    defaultMessage: 'Superuser',
  },
});

interface BrandingHeadProps {
  title?: string | null;
}

const AdminMenuButton = (): JSX.Element | null => {
  const { t } = useTranslation();

  const { user } = useAppContext();

  const isSuperAdmin = user?.role === 'administrator';
  const isInstanceAdmin = user?.instanceRole === 'administrator';

  const [anchorElement, setAnchorElement] = useState<HTMLElement>();

  if (!(isSuperAdmin || isInstanceAdmin)) return null;

  return (
    <>
      <IconButton
        className="-mr-4 ml-4"
        edge="end"
        onClick={(e): void => setAnchorElement(e.currentTarget)}
      >
        <AdminPanelSettingsOutlined />
      </IconButton>

      <PopupMenu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={(): void => setAnchorElement(undefined)}
      >
        <PopupMenu.List header={t(translations.superuser)}>
          {isSuperAdmin && (
            <PopupMenu.Button to="/admin">
              {t(translations.adminPanel)}
            </PopupMenu.Button>
          )}

          {(isSuperAdmin || isInstanceAdmin) && (
            <PopupMenu.Button to="/admin/instance">
              {t(translations.instanceAdminPanel)}
            </PopupMenu.Button>
          )}
        </PopupMenu.List>
      </PopupMenu>
    </>
  );
};

const Brand = (): JSX.Element => {
  const { t } = useTranslation();

  // TODO: Remove `reloads` once fully SPA
  return (
    <Link reloads to="/" underline="hover">
      <Typography>{t(translations.coursemology)}</Typography>
    </Link>
  );
};

const UserMenuButton = (): JSX.Element | null => {
  const { user } = useAppContext();

  const [anchorElement, setAnchorElement] = useState<HTMLElement>();

  if (!user) return null;

  return (
    <>
      <div
        className="!-mr-4 flex h-full cursor-pointer select-none items-center space-x-4 p-4 border-only-l-neutral-200 hover:bg-neutral-100 active:bg-neutral-200"
        onClick={(e): void => setAnchorElement(e.currentTarget)}
        role="button"
        tabIndex={0}
      >
        <Avatar alt={user.name} className="wh-12" src={user.avatarUrl} />

        <Typography
          className="max-w-[15rem] overflow-hidden text-ellipsis whitespace-nowrap text-neutral-500 max-md:hidden"
          variant="body2"
        >
          {user.name}
        </Typography>
      </div>

      <PopupMenu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={(): void => setAnchorElement(undefined)}
      >
        <UserPopupMenuList />
      </PopupMenu>
    </>
  );
};

const BrandingHeadContainer = (props: { children: ReactNode }): JSX.Element => (
  <div className="flex h-[4rem] items-center justify-between px-4">
    {props.children}
  </div>
);

const BrandingHead = (props: BrandingHeadProps): JSX.Element => (
  <BrandingHeadContainer>
    <div className="flex items-center space-x-2">
      <Brand />

      {props.title && (
        <div className="flex items-center space-x-2 text-neutral-500">
          <ChevronRight />
          <Typography className="line-clamp-1">{props.title}</Typography>
        </div>
      )}
    </div>

    <div className="flex h-full items-center space-x-4">
      <AdminMenuButton />
      <UserMenuButton />
    </div>
  </BrandingHeadContainer>
);

const MiniBrandingHead = (): JSX.Element => (
  <BrandingHeadContainer>
    <Brand />
    <AdminMenuButton />
  </BrandingHeadContainer>
);

export default Object.assign(BrandingHead, { Mini: MiniBrandingHead });
