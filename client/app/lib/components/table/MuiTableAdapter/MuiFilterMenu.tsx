import { useState } from 'react';
import { FilterList } from '@mui/icons-material';
import {
  Badge,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  MenuList,
  Tooltip,
} from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { FilterProps } from '../adapters';

import MuiFilterMenuItem from './MuiFilterMenuItem';
import translations from './translations';

const CLEAR_FILTERS_MENU_ITEM_KEY = 'clearFiltersMenuItem' as const;
const CLEAR_FILTERS_DIVIDER_KEY = 'clearFiltersMenuItemDivider' as const;

const MuiFilterMenu = (props: FilterProps): JSX.Element => {
  const { filters } = props;

  const { t } = useTranslation();

  const [anchor, setAnchor] = useState<HTMLElement>();

  const filtersSet = new Set(filters);

  const closeMenu = (): void => setAnchor(undefined);

  return (
    <>
      <Badge badgeContent={filters?.length} color="primary" overlap="circular">
        <Tooltip title={props.tooltipLabel ?? t(translations.filter)}>
          <IconButton
            className={props.className}
            color={filters?.length ? 'primary' : undefined}
            onClick={(e): void => setAnchor(e.currentTarget)}
            size="small"
          >
            <FilterList />
          </IconButton>
        </Tooltip>
      </Badge>

      <Menu anchorEl={anchor} onClose={closeMenu} open={Boolean(anchor)}>
        {Boolean(filters?.length) && [
          <MenuItem
            key={CLEAR_FILTERS_MENU_ITEM_KEY}
            dense
            onClick={(): void => {
              closeMenu();
              props.onClearFilters?.();
            }}
          >
            {props.clearFiltersLabel ?? t(translations.clearFilter)}
          </MenuItem>,
          <Divider key={CLEAR_FILTERS_DIVIDER_KEY} />,
        ]}

        <MenuList autoFocusItem dense variant="selectedMenu">
          {props.uniqueFilterValues.map((value, index) => {
            let label: string | number | undefined =
              props.getFilterLabel?.(value);

            if (typeof value === 'string' || typeof value === 'number')
              label ||= value;

            return (
              <MuiFilterMenuItem
                key={label ?? index}
                label={
                  label?.toString() ?? t(translations.filterIndex, { index })
                }
                onDeselect={(): void => props.onAddFilter?.(value)}
                onSelect={(): void => props.onRemoveFilter?.(value)}
                selected={filtersSet.has(value)}
              />
            );
          })}
        </MenuList>
      </Menu>
    </>
  );
};

export default MuiFilterMenu;
