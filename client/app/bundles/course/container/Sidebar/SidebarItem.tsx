import { useLayoutEffect, useRef } from 'react';
import { defineMessages } from 'react-intl';
import { Link, useLocation } from 'react-router-dom';
import { Badge, Typography } from '@mui/material';
import { SidebarItemData } from 'types/course/courses';

import { defensivelyGetIcon } from 'lib/constants/icons';
import useTranslation from 'lib/hooks/useTranslation';

interface SidebarItemProps {
  of: SidebarItemData;
  square?: boolean;
  exact?: boolean;
  activePath?: string;
}

const SidebarItem = (props: SidebarItemProps): JSX.Element => {
  const { of: item, square, exact, activePath } = props;

  const location = useLocation();
  const activeUrl = activePath ?? location.pathname + location.search;

  const isActive = exact
    ? activeUrl === item.path
    : activeUrl.startsWith(item.path);

  const Icon = defensivelyGetIcon(item.icon, isActive ? 'filled' : 'outlined');

  const ref = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    if (!isActive) return;

    ref.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }, [isActive]);

  return (
    <Link
      ref={ref}
      className={`no-underline ${isActive ? 'text-primary' : 'text-inherit'}`}
      to={item.path}
    >
      <div
        className={`flex select-none items-center space-x-5 p-4 transition-transform active:scale-95 active:rounded-xl ${
          !square ? 'rounded-xl' : ''
        } ${
          isActive
            ? 'bg-primary/10 hover:bg-primary/20 active:bg-primary/30'
            : 'hover:bg-neutral-200 active:bg-neutral-300'
        }`}
        role="button"
      >
        <Badge badgeContent={item.unread?.toString()} color="primary" max={999}>
          <Icon />
        </Badge>

        <Typography
          className="overflow-hidden text-ellipsis whitespace-nowrap font-medium"
          variant="body2"
        >
          {item.label}
        </Typography>
      </div>
    </Link>
  );
};

const translations = defineMessages({
  home: {
    id: 'course.courses.SidebarItem.home',
    defaultMessage: 'Home',
  },
});

const HomeSidebarItem = (props: { to: string }): JSX.Element => {
  const { t } = useTranslation();

  return (
    <SidebarItem
      exact
      of={{
        key: 'home',
        icon: 'home',
        label: t(translations.home),
        path: props.to,
      }}
    />
  );
};

export default Object.assign(SidebarItem, { Home: HomeSidebarItem });
