import { MouseEvent, useState, useTransition } from 'react';
import { defineMessages } from 'react-intl';
import Done from '@mui/icons-material/Done';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
import { Button, MenuItem, MenuList, Popover } from '@mui/material';

import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { actions } from '../../store';
import TranslatedItemType from '../TranslatedItemType';

const translations = defineMessages({
  filter: {
    id: 'course.lessonPlan.LessonPlanFilter.filter',
    defaultMessage: 'Filter',
  },
});

const LessonPlanFilter = (): JSX.Element | null => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const visibility = useAppSelector(
    (state) => state.lessonPlan.lessonPlan.visibilityByType,
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // Showing a hidden type mounts its rows' date pickers, which is heavy; as a
  // transition that render is interruptible rather than blocking the click.
  const [, startTransition] = useTransition();

  const itemTypes = Object.keys(visibility);
  if (itemTypes.length < 1) return null;

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    // This prevents ghost click.
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Button
        color="secondary"
        endIcon={<KeyboardArrowUp />}
        onClick={handleClick}
        variant="contained"
      >
        {t(translations.filter)}
      </Button>

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
        onClose={(): void => setAnchorEl(null)}
        open={Boolean(anchorEl)}
        transformOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuList>
          {itemTypes.map((itemType) => {
            const isVisible = visibility[itemType];
            return (
              <MenuItem
                key={itemType}
                onClick={(): void => {
                  startTransition(() => {
                    dispatch(
                      actions.setItemTypeVisibility({
                        itemType,
                        isVisible: !isVisible,
                      }),
                    );
                  });
                }}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                <TranslatedItemType type={itemType} />
                {isVisible && <Done />}
              </MenuItem>
            );
          })}
        </MenuList>
      </Popover>
    </>
  );
};

export default LessonPlanFilter;
