import { ReactNode, useLayoutEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Typography } from '@mui/material';

interface SidebarItemProps {
  label: string;
  icon: ReactNode;
  /** Shown instead of `icon` while the item is active. Defaults to `icon`. */
  activeIcon?: ReactNode;
  /** Without a destination, the item is shown greyed out and cannot be clicked. */
  to?: string;
  active?: boolean;
  id?: string;
  badgeCount?: number;
  square?: boolean;
}

const SidebarItem = (props: SidebarItemProps): JSX.Element => {
  const { label, icon, activeIcon, to, active, id, badgeCount, square } = props;

  const shownIcon = active ? activeIcon ?? icon : icon;

  const ref = useRef<HTMLAnchorElement>(null);

  useLayoutEffect(() => {
    if (!active) return;

    ref.current?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
  }, [active]);

  if (to) {
    return (
      <Link
        ref={ref}
        aria-current={active ? 'page' : undefined}
        className={`no-underline ${active ? 'text-primary' : 'text-inherit'}`}
        id={id}
        to={to}
      >
        <div
          className={`flex select-none items-center space-x-5 p-4 transition-transform active:scale-95 active:rounded-xl ${
            !square ? 'rounded-xl' : ''
          } ${
            active
              ? 'bg-primary/10 hover:bg-primary/20 active:bg-primary/30'
              : 'hover:bg-neutral-200 active:bg-neutral-300'
          }`}
          role="button"
        >
          <Badge badgeContent={badgeCount} color="primary" max={999}>
            {shownIcon}
          </Badge>

          <Typography
            className="overflow-hidden text-ellipsis whitespace-nowrap font-medium"
            variant="body2"
          >
            {label}
          </Typography>
        </div>
      </Link>
    );
  }

  return (
    <div className="flex select-none items-center space-x-5 p-4">
      <span className="flex text-gray-400">{shownIcon}</span>

      <Typography
        className="overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-400"
        variant="body2"
      >
        {label}
      </Typography>
    </div>
  );
};

export default SidebarItem;
