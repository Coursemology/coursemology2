import {
  ComponentProps,
  createContext,
  ReactNode,
  useContext,
  useRef,
} from 'react';
import {
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListSubheader,
  Popover,
  Typography,
} from '@mui/material';

import Link from 'lib/components/core/Link';

interface PopupMenuContextProps {
  close: () => void;
}

const PopupMenuContext = createContext<PopupMenuContextProps>({
  close: () => {},
});

interface PopupMenuProps extends Partial<ComponentProps<typeof Popover>> {
  onClose: () => void;
  anchorEl?: HTMLElement | null;
  children?: ReactNode;
}

const PopupMenu = (props: PopupMenuProps): JSX.Element => {
  const { anchorEl, onClose, children } = props;

  const ref = useRef<HTMLDivElement>(null);

  return (
    <Popover
      ref={ref}
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      classes={{
        paper: 'max-w-[50rem] sm:max-w-full rounded-xl shadow-lg mr-[1.6rem]',
      }}
      onClose={onClose}
      open={Boolean(anchorEl)}
      PaperProps={{ variant: 'outlined' }}
    >
      {/* eslint-disable-next-line react/jsx-no-constructed-context-values */}
      <PopupMenuContext.Provider value={{ close: onClose }}>
        {children}
      </PopupMenuContext.Provider>
    </Popover>
  );
};

interface PopupMenuButtonProps {
  onClick?: () => void;
  to?: string;
  children?: ReactNode;
  textProps?: ComponentProps<typeof Typography>;
  disabled?: boolean;
}

const PopupMenuButton = (props: PopupMenuButtonProps): JSX.Element => {
  const { to: href } = props;

  const { close } = useContext(PopupMenuContext);

  const handleClick = (): void => {
    close();
    props.onClick?.();
  };

  const button = (
    <ListItem disablePadding>
      <ListItemButton disabled={props.disabled} onClick={handleClick}>
        <ListItemText primaryTypographyProps={props.textProps}>
          {props.children}
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );

  return href && !props.disabled ? (
    <Link to={href} underline="hover">
      {button}
    </Link>
  ) : (
    button
  );
};

interface PopupMenuTextProps extends ComponentProps<typeof Typography> {
  children?: ReactNode;
}

const PopupMenuText = (props: PopupMenuTextProps): JSX.Element => {
  const { children, ...typographyProps } = props;

  return (
    <ListItem>
      <ListItemText primaryTypographyProps={typographyProps}>
        {children}
      </ListItemText>
    </ListItem>
  );
};

interface PopupMenuListProps {
  className?: string;
  header?: string;
  children?: ReactNode;
}

const PopupMenuList = (props: PopupMenuListProps): JSX.Element => {
  return (
    <List
      className={props.className}
      dense
      subheader={
        props.header && (
          <ListSubheader className="pb-1 pt-5 leading-none">
            <Typography variant="caption">{props.header}</Typography>
          </ListSubheader>
        )
      }
    >
      {props.children}
    </List>
  );
};

export default Object.assign(PopupMenu, {
  Button: PopupMenuButton,
  Text: PopupMenuText,
  List: PopupMenuList,
  Item: ListItem,
  Divider,
});
