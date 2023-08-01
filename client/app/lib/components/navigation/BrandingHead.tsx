import { ComponentRef, ReactNode, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import { ChevronRight, KeyboardArrowDown } from '@mui/icons-material';
import { Avatar, Button, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import PopupMenu from 'lib/components/core/PopupMenu';
import { useAppContext } from 'lib/containers/AppContainer';
import useTranslation from 'lib/hooks/useTranslation';

import AdminPopupMenuList from './AdminPopupMenuList';
import CourseSwitcherPopupMenu from './CourseSwitcherPopupMenu';
import UserPopupMenuList from './UserPopupMenuList';

const translations = defineMessages({
  coursemology: {
    id: 'app.BrandingItem.coursemology',
    defaultMessage: 'Coursemology',
  },
  goToOtherCourses: {
    id: 'app.BrandingItem.goToOtherCourses',
    defaultMessage: 'Courses',
  },
  signIn: {
    id: 'app.BrandingItem.signIn',
    defaultMessage: 'Sign in',
  },
});

interface BrandingHeadProps {
  title?: string | null;
  withoutCourseSwitcher?: boolean;
  withoutUserMenu?: boolean;
}

const Brand = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Link
      className="hover:text-primary"
      color="inherit"
      to="/"
      underline="none"
    >
      <Typography className="font-medium tracking-tighter">
        {t(translations.coursemology)}
      </Typography>
    </Link>
  );
};

const UserMenuButton = (): JSX.Element | null => {
  const { user } = useAppContext();

  const { t } = useTranslation();

  const [anchorElement, setAnchorElement] = useState<HTMLElement>();

  if (!user)
    return (
      <Link to="/users/sign_in">
        <Button variant="contained">{t(translations.signIn)}</Button>
      </Link>
    );

  return (
    <>
      <Avatar
        alt={user.name}
        className="ring-neutral-200 ring-offset-1 wh-12 hover:ring-2"
        data-testid="user-menu-button"
        onClick={(e): void => setAnchorElement(e.currentTarget)}
        role="button"
        src={user.avatarUrl}
        tabIndex={0}
      />

      <PopupMenu
        anchorEl={anchorElement}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        onClose={(): void => setAnchorElement(undefined)}
      >
        <PopupMenu.List className="-space-y-6">
          <PopupMenu.Text className="max-w-lg font-medium">
            {user.name}
          </PopupMenu.Text>

          <PopupMenu.Text color="text.secondary">
            {user.primaryEmail}
          </PopupMenu.Text>
        </PopupMenu.List>

        <PopupMenu.Divider />

        <AdminPopupMenuList />

        <UserPopupMenuList />
      </PopupMenu>
    </>
  );
};

const BrandingHeadContainer = (props: { children: ReactNode }): JSX.Element => (
  <div className="flex h-[4.5rem] items-center justify-between px-4">
    {props.children}
  </div>
);

const BrandingHead = (props: BrandingHeadProps): JSX.Element => {
  const { t } = useTranslation();

  const courseSwitcherRef =
    useRef<ComponentRef<typeof CourseSwitcherPopupMenu>>(null);

  return (
    <>
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
          {!props.withoutCourseSwitcher && (
            <Button
              endIcon={<KeyboardArrowDown />}
              onClick={(e): void => courseSwitcherRef.current?.open(e)}
              variant="text"
            >
              {t(translations.goToOtherCourses)}
            </Button>
          )}

          {!props.withoutUserMenu && <UserMenuButton />}
        </div>
      </BrandingHeadContainer>

      <CourseSwitcherPopupMenu ref={courseSwitcherRef} />
    </>
  );
};

const MiniBrandingHead = (): JSX.Element => (
  <BrandingHeadContainer>
    <Brand />
    <UserMenuButton />
  </BrandingHeadContainer>
);

export default Object.assign(BrandingHead, { Mini: MiniBrandingHead });
