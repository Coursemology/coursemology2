import { MenuItem, MenuList, Paper, PopoverProps, Popper } from '@mui/material';
import { CourseUserMiniEntity } from 'types/course/courseUsers';
import { TimelineData } from 'types/course/referenceTimelines';

import { assignToTimeline } from 'bundles/course/users/operations';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../../translations';

interface BulkAssignTimelineMenuProps {
  selectedRows: CourseUserMiniEntity[];
  onClose: () => void;
  anchorEl: PopoverProps['anchorEl'];
  open: boolean;
  timelinesMap: Record<number, string>;
}

const BulkAssignTimelineMenu = (
  props: BulkAssignTimelineMenuProps,
): JSX.Element => {
  const { anchorEl, selectedRows, timelinesMap, onClose, open } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const handleAssignUsersToTimeline = (
    ids: CourseUserMiniEntity['id'][],
    timelineId: TimelineData['id'],
    timelineTitle: TimelineData['title'],
  ): void => {
    dispatch(assignToTimeline(ids, timelineId))
      .then(() => {
        toast.success(
          t(translations.bulkChangeTimelineSuccess, {
            n: ids.length,
            timeline: timelineTitle ?? t(translations.defaultTimeline),
          }),
        );
      })
      .catch(() => {
        toast.error(
          t(translations.bulkChangeTimelineFailure, {
            n: ids.length,
            timeline: timelineTitle ?? t(translations.defaultTimeline),
          }),
        );
      });
  };

  return (
    <Popper
      anchorEl={anchorEl}
      open={open}
      placement="right-start"
      sx={{ zIndex: (theme) => theme.zIndex.modal + 1 }}
    >
      <Paper className="p-0" variant="outlined">
        <MenuList className="p-0" dense>
          {Object.entries(timelinesMap).map(([id, title]) => (
            <MenuItem
              key={id}
              className="h-12"
              onClick={(): void => {
                const timelineId = parseInt(id, 10);
                const ids = selectedRows.map((user) => user.id);
                if (ids.length)
                  handleAssignUsersToTimeline(ids, timelineId, title);

                onClose();
              }}
            >
              {title ?? t(translations.defaultTimeline)}
            </MenuItem>
          ))}
        </MenuList>
      </Paper>
    </Popper>
  );
};

export default BulkAssignTimelineMenu;
