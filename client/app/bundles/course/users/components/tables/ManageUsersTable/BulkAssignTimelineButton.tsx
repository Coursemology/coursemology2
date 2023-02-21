import { useState } from 'react';
import { toast } from 'react-toastify';
import { ExpandMore } from '@mui/icons-material';
import { Button, Menu, MenuItem } from '@mui/material';
import { CourseUserMiniEntity } from 'types/course/courseUsers';
import { TimelineData } from 'types/course/referenceTimelines';

import { assignToTimeline } from 'bundles/course/users/operations';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import translations from './translations';

interface BulkAssignTimelineButtonProps {
  getSelectedIds: () => number[];
  timelinesMap: Record<number, string>;
}

const BulkAssignTimelineButton = (
  props: BulkAssignTimelineButtonProps,
): JSX.Element => {
  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [timelinesMenu, setTimelinesMenu] = useState<HTMLButtonElement>();

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
    <>
      <Button
        endIcon={<ExpandMore />}
        onClick={(e): void => setTimelinesMenu(e.currentTarget)}
        size="small"
      >
        {t(translations.assignToTimeline)}
      </Button>

      <Menu
        anchorEl={timelinesMenu}
        onClose={(): void => setTimelinesMenu(undefined)}
        open={Boolean(timelinesMenu)}
      >
        {Object.entries(props.timelinesMap).map(([id, title]) => (
          <MenuItem
            key={id}
            onClick={(): void => {
              const timelineId = parseInt(id, 10);
              const ids = props.getSelectedIds();
              if (ids.length)
                handleAssignUsersToTimeline(ids, timelineId, title);

              setTimelinesMenu(undefined);
            }}
          >
            {title ?? t(translations.defaultTimeline)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default BulkAssignTimelineButton;
