import { FC, useEffect, useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import {
  Collapse,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';

interface CollapsibleListProps {
  children: JSX.Element;
  headerTitle: JSX.Element;
  headerAction?: JSX.Element;
  collapsedByDefault?: boolean;
  forceExpand?: boolean;
  level?: number;
}

const CollapsibleList: FC<CollapsibleListProps> = (props) => {
  const {
    headerAction,
    collapsedByDefault = false,
    forceExpand,
    headerTitle,
    children,
    level = 0,
  } = props;
  const [isOpen, setIsOpen] = useState(!collapsedByDefault);
  useEffect(() => {
    if (forceExpand !== undefined) {
      setIsOpen(forceExpand);
    }
  }, [forceExpand]);
  return (
    <>
      <div className="flex items-center justify-between">
        <ListItemButton
          onClick={(): void => setIsOpen((prevValue) => !prevValue)}
          style={{ paddingLeft: `${level}rem` }}
        >
          <ListItemIcon className="min-w-0">
            {isOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemIcon>
          {headerTitle}
        </ListItemButton>
        {headerAction}
      </div>
      {isOpen && <Divider className="border-neutral-300 last:border-none" />}
      <Collapse in={isOpen} timeout="auto">
        <List dense disablePadding>
          {children}
        </List>
      </Collapse>
      <Divider className="border-neutral-300 last:border-none" />
    </>
  );
};

export default CollapsibleList;
