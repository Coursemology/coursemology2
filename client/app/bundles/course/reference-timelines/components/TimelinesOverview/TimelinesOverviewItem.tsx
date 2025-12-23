import { useState } from 'react';
import { MoreVert } from '@mui/icons-material';
import { Divider, IconButton, Menu, MenuItem } from '@mui/material';
import { TimelineData } from 'types/course/referenceTimelines';

import Checkbox from 'lib/components/core/buttons/Checkbox';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { useLastSaved, useSetLastSaved } from '../../contexts';
import { deleteTimeline } from '../../operations';
import translations from '../../translations';
import CreateRenameTimelinePrompt from '../CreateRenameTimelinePrompt';
import DeleteTimelinePrompt from '../DeleteTimelinePrompt';

interface TimelinesOverviewItemProps {
  for: TimelineData;
  checked?: boolean;
  onChangeCheck?: (checked: boolean) => void;
}

const TimelinesOverviewItem = (
  props: TimelinesOverviewItemProps,
): JSX.Element => {
  const { for: timeline } = props;

  const { t } = useTranslation();

  const dispatch = useAppDispatch();

  const [menuAnchor, setMenuAnchor] = useState<HTMLButtonElement>();
  const [renaming, setRenaming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const { status } = useLastSaved();
  const { startLoading, abortLoading, setLastSavedToNow } = useSetLastSaved();

  const handleDelete = (alternativeTimelineId?: TimelineData['id']): void => {
    startLoading();

    dispatch(deleteTimeline(timeline.id, alternativeTimelineId))
      .then(setLastSavedToNow)
      .catch((error) => {
        abortLoading();

        toast.error(
          error ??
            t(translations.errorDeletingTimeline, {
              title: timeline.title ?? '',
            }),
        );
      });
  };

  return (
    <div key={timeline.id} className="flex shrink-0 items-start space-x-2">
      <Checkbox
        checked={props.checked}
        description={
          !timeline.default && timeline.timesCount
            ? t(translations.nAssigned, { n: timeline.timesCount })
            : undefined
        }
        descriptionVariant="caption"
        disabled={timeline.default ?? status === 'loading'}
        label={timeline.title ?? t(translations.defaultTimeline)}
        labelClassName="!-mb-2 line-clamp-1 max-w-[20rem]"
        onChange={(_, checked): void => props.onChangeCheck?.(checked)}
        variant="body2"
      />

      {!timeline.default && (
        <IconButton
          disabled={status === 'loading'}
          edge="start"
          onClick={(e): void => setMenuAnchor(e.currentTarget)}
          size="small"
        >
          <MoreVert />
        </IconButton>
      )}

      <Menu
        anchorEl={menuAnchor}
        MenuListProps={{ dense: true }}
        onClick={(): void => setMenuAnchor(undefined)}
        onClose={(): void => setMenuAnchor(undefined)}
        open={Boolean(menuAnchor)}
      >
        {!timeline.default && [
          <MenuItem
            key="delete"
            disabled={status === 'loading'}
            onClick={(): void => {
              if (timeline.timesCount || timeline.assignees) {
                setDeleting(true);
              } else {
                handleDelete();
              }
            }}
          >
            {t(translations.deleteTimeline)}
          </MenuItem>,

          <Divider key="divider" />,
        ]}

        {!timeline.default && (
          <MenuItem onClick={(): void => setRenaming(true)}>
            {t(translations.renameTimeline)}
          </MenuItem>
        )}
      </Menu>

      <CreateRenameTimelinePrompt
        onClose={(): void => setRenaming(false)}
        open={renaming}
        renames={timeline}
      />

      <DeleteTimelinePrompt
        deletes={timeline}
        disabled={status === 'loading'}
        onClose={(): void => setDeleting(false)}
        onConfirmDelete={handleDelete}
        open={deleting}
      />
    </div>
  );
};

export default TimelinesOverviewItem;
