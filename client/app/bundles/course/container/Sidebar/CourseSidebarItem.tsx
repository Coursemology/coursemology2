import { createElement } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarItemData } from 'types/course/courses';

import SidebarItem from 'lib/components/navigation/sidebar/SidebarItem';
import { defensivelyGetIcon } from 'lib/constants/icons';
import { useUnreadCountForItem } from 'lib/hooks/unread';
import useTranslation from 'lib/hooks/useTranslation';

import { getComponentTitle } from '../../translations';

interface CourseSidebarItemProps {
  of: SidebarItemData;
  square?: boolean;
  exact?: boolean;
  activePath?: string;
}

const CourseSidebarItem = (props: CourseSidebarItemProps): JSX.Element => {
  const { of: item, square, exact, activePath } = props;

  const { t } = useTranslation();

  const location = useLocation();
  const activeUrl = activePath ?? location.pathname + location.search;

  const isActive =
    exact ||
    (item.path &&
      (item.exact ? activeUrl === item.path : activeUrl.startsWith(item.path)));

  const unreadCount = useUnreadCountForItem(item.key);

  return (
    <SidebarItem
      active={Boolean(isActive)}
      activeIcon={createElement(defensivelyGetIcon(item.icon, 'filled'))}
      badgeCount={unreadCount}
      icon={createElement(defensivelyGetIcon(item.icon, 'outlined'))}
      id={`sidebar_item_${item.key}`}
      label={getComponentTitle(t, item.key, item.label) ?? ''}
      square={square}
      to={item.path}
    />
  );
};

const HomeSidebarItem = (props: { to: string }): JSX.Element => {
  return (
    <CourseSidebarItem
      of={{
        key: 'sidebar_home',
        icon: 'home',
        path: props.to,
        exact: true,
      }}
    />
  );
};

export default Object.assign(CourseSidebarItem, { Home: HomeSidebarItem });
