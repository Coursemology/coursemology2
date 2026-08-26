import { MouseEvent, useState, useTransition } from 'react';
import { defineMessages } from 'react-intl';
import Done from '@mui/icons-material/Done';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Button, MenuItem, MenuList, Popover } from '@mui/material';

import { LESSON_PLAN_EDIT_COLUMNS } from 'course/lesson-plan/types';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { actions } from '../../store';
import fieldTranslations from '../../translations';

const translations = defineMessages({
  label: {
    id: 'course.lessonPlan.ColumnVisibilityDropdown.label',
    defaultMessage: 'Columns',
  },
});

const ColumnVisibilityDropdown = (): JSX.Element => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const columnsVisible = useAppSelector(
    (state) => state.lessonPlan.flags.editPageColumnsVisible,
  );

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  // Showing a hidden type mounts its rows' date pickers, which is heavy; as a
  // transition that render is interruptible rather than blocking the click.
  const [, startTransition] = useTransition();

  const handleClick = (event: MouseEvent<HTMLElement>): void => {
    // This prevents ghost click.
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  return (
    <>
      <Button
        color="secondary"
        endIcon={<KeyboardArrowDown />}
        onClick={handleClick}
        variant="contained"
      >
        {t(translations.label)}
      </Button>

      <Popover
        anchorEl={anchorEl}
        anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        onClose={(): void => setAnchorEl(null)}
        open={Boolean(anchorEl)}
        transformOrigin={{ horizontal: 'left', vertical: 'top' }}
      >
        <MenuList style={{ maxHeight: 450 }}>
          {LESSON_PLAN_EDIT_COLUMNS.map((field) => {
            const isVisible = columnsVisible[field];
            return (
              <MenuItem
                key={field}
                onClick={(): void => {
                  startTransition(() => {
                    dispatch(
                      actions.setColumnVisibility({
                        field,
                        isVisible: !isVisible,
                      }),
                    );
                  });
                }}
                style={{ display: 'flex', justifyContent: 'space-between' }}
              >
                {t(fieldTranslations[field])}
                {isVisible && <Done />}
              </MenuItem>
            );
          })}
        </MenuList>
      </Popover>
    </>
  );
};

export default ColumnVisibilityDropdown;
