import { useRef, useState } from 'react';
import {
  AddModeratorOutlined,
  ExpandMore,
  RemoveModeratorOutlined,
  ViewTimelineOutlined,
} from '@mui/icons-material';
import {
  Button,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
} from '@mui/material';
import { CourseUserMiniEntity } from 'types/course/courseUsers';

import { suspendUsers, unsuspendUsers } from 'bundles/course/users/operations';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

import BulkAssignTimelineMenu from './BulkAssignTimelineMenu';

interface BulkActionsButtonProps {
  timelinesMap?: Record<number, string>;
  selectedRows: CourseUserMiniEntity[];
}

const BulkActionsButton = (props: BulkActionsButtonProps): JSX.Element => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [mainMenuAnchor, setMainMenuAnchor] = useState<HTMLElement>();
  const [timelinesMenuAnchor, setTimelinesMenuAnchor] = useState<HTMLElement>();
  const paperRef = useRef<HTMLElement>();

  const handleSuspend = (): void => {
    const ids = props.selectedRows.map((user) => user.id);
    dispatch(suspendUsers(ids))
      .then(() => {
        toast.success(
          t(translations.bulkSuspendSuccess, {
            n: ids.length,
          }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.bulkSuspendFailure, {
            n: ids.length,
          }),
        );
      });
  };

  const handleUnsuspend = (): void => {
    const ids = props.selectedRows.map((user) => user.id);
    dispatch(unsuspendUsers(ids))
      .then(() => {
        toast.success(
          t(translations.bulkUnsuspendSuccess, {
            n: ids.length,
          }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.bulkUnsuspendFailure, {
            n: ids.length,
          }),
        );
      });
  };

  return (
    <>
      <Button
        endIcon={<ExpandMore />}
        onClick={(e): void => setMainMenuAnchor(e.currentTarget)}
        size="small"
        variant="outlined"
      >
        {t(translations.bulkActions)}
      </Button>

      <Popover
        anchorEl={mainMenuAnchor}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        onClose={(): void => {
          setMainMenuAnchor(undefined);
          setTimelinesMenuAnchor(undefined);
        }}
        open={Boolean(mainMenuAnchor)}
        slotProps={{
          paper: {
            variant: 'outlined',
            ref: (el: HTMLDivElement | null) => {
              paperRef.current = el ?? undefined;
            },
          },
        }}
      >
        <MenuList className="p-0" dense>
          {props.timelinesMap && (
            <MenuItem
              className="py-0 pl-0 pr-3 h-12"
              onClick={() =>
                setTimelinesMenuAnchor(
                  timelinesMenuAnchor ? undefined : paperRef.current,
                )
              }
              selected={Boolean(timelinesMenuAnchor)}
            >
              <ListItemIcon className="flex justify-center">
                <ViewTimelineOutlined className="text-3xl" />
              </ListItemIcon>
              <ListItemText>{t(translations.assignToTimeline)}</ListItemText>
            </MenuItem>
          )}

          <MenuItem
            className="py-0 pl-0 pr-3 h-12"
            disabled={props.selectedRows.every((user) => user.isSuspended)}
            onClick={handleSuspend}
          >
            <ListItemIcon className="flex justify-center">
              <RemoveModeratorOutlined className="text-3xl" />
            </ListItemIcon>
            <ListItemText>{t(translations.suspend)}</ListItemText>
          </MenuItem>

          <MenuItem
            className="py-0 pl-0 pr-3 h-12"
            disabled={props.selectedRows.every((user) => !user.isSuspended)}
            onClick={handleUnsuspend}
          >
            <ListItemIcon className="flex justify-center">
              <AddModeratorOutlined className="text-3xl" />
            </ListItemIcon>
            <ListItemText>{t(translations.unsuspend)}</ListItemText>
          </MenuItem>
          {props.timelinesMap && (
            <BulkAssignTimelineMenu
              anchorEl={timelinesMenuAnchor}
              onClose={(): void => {
                setTimelinesMenuAnchor(undefined);
                setMainMenuAnchor(undefined);
              }}
              open={Boolean(timelinesMenuAnchor)}
              selectedRows={props.selectedRows}
              timelinesMap={props.timelinesMap}
            />
          )}
        </MenuList>
      </Popover>
    </>
  );
};

export default BulkActionsButton;
