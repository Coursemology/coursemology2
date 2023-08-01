import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { DateRange, PushPin } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';
import equal from 'fast-deep-equal';
import { Operation } from 'store';
import {
  AnnouncementEntity,
  AnnouncementFormData,
} from 'types/course/announcements';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import CustomTooltip from 'lib/components/core/CustomTooltip';
import Link from 'lib/components/core/Link';
import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import { formatFullDateTime } from 'lib/moment';

import AnnouncementEdit from '../../pages/AnnouncementEdit';

interface Props extends WrappedComponentProps {
  announcement: AnnouncementEntity;
  showEditOptions?: boolean;
  updateOperation?: (
    announcementId: number,
    formData: AnnouncementFormData,
  ) => Operation;
  deleteOperation?: (announcementId: number) => Operation;
  canSticky?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.announcements.AnnouncementCard.deletionSuccess',
    defaultMessage: 'Announcement was successfully deleted.',
  },
  deletionFailure: {
    id: 'course.announcements.AnnouncementCard.deletionFailure',
    defaultMessage: 'Announcement could not be deleted - {error}',
  },
  timeSeparator: {
    id: 'course.announcements.AnnouncementCard.timeSeparator',
    defaultMessage: 'by',
  },
  pinnedTooltip: {
    id: 'course.announcements.AnnouncementCard.pinnedTooltip',
    defaultMessage: 'Pinned',
  },
  notInRangeTooltip: {
    id: 'course.announcements.AnnouncementCard.notInRangeTooltip',
    defaultMessage: 'Out of date range',
  },
  deleteConfirmation: {
    id: 'course.announcements.AnnouncementCard.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete the announcement',
  },
});

const AnnouncementCard: FC<Props> = (props) => {
  const {
    intl,
    announcement,
    showEditOptions,
    updateOperation,
    deleteOperation,
    canSticky = true,
  } = props;

  // For editing announcements form dialog
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialValues = {
    title: announcement.title,
    content: announcement.content,
    sticky: announcement.isSticky,
    startAt: new Date(announcement.startTime),
    endAt: new Date(announcement.endTime),
  };

  const dispatch = useAppDispatch();
  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteOperation!(announcement.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
      })
      .catch((error) => {
        setIsDeleting(false);
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          intl.formatMessage(translations.deletionFailure, {
            error: errorMessage,
          }),
        );
        throw error;
      });
  };

  const onEdit = (): void => setIsOpen(true);

  const renderUserLink = (): JSX.Element => {
    if (announcement.creator.id === -1) {
      return <span>{announcement.creator.name}</span>;
    }
    return (
      <Link to={announcement.creator.userUrl} underline="hover">
        {announcement.creator.name}
      </Link>
    );
  };

  return (
    <>
      <Paper
        key={announcement.id}
        className="announcement p-4"
        id={`announcement-${announcement.id}`}
        style={{
          backgroundColor: announcement.isUnread ? '#ffe8e8' : '#ffffff',
        }}
        variant="outlined"
      >
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex' }}>
            {announcement.isSticky && (
              <CustomTooltip
                title={intl.formatMessage(translations.pinnedTooltip)}
              >
                <PushPin fontSize="small" style={{ marginTop: 3 }} />
              </CustomTooltip>
            )}
            {!announcement.isCurrentlyActive && (
              <CustomTooltip
                title={intl.formatMessage(translations.notInRangeTooltip)}
              >
                <DateRange fontSize="small" style={{ marginTop: 3 }} />
              </CustomTooltip>
            )}
            <Typography
              style={{
                marginTop: 0,
                marginBottom: 0,
                marginLeft:
                  announcement.isSticky || !announcement.isCurrentlyActive
                    ? 5
                    : 0,
                fontWeight: 'bold',
                overflowWrap: 'anywhere',
              }}
              variant="h5"
            >
              {announcement.title}
            </Typography>
          </div>
          {showEditOptions && updateOperation && deleteOperation && (
            <div style={{ display: 'flex' }}>
              {announcement.permissions.canEdit && (
                <EditButton
                  id={`announcement-edit-button-${announcement.id}`}
                  onClick={onEdit}
                />
              )}
              {announcement.permissions.canDelete && (
                <DeleteButton
                  confirmMessage={`${intl.formatMessage(
                    translations.deleteConfirmation,
                  )} (${announcement.title})?`}
                  disabled={isDeleting}
                  id={`announcement-delete-button-${announcement.id}`}
                  loading={isDeleting}
                  onClick={onDelete}
                />
              )}
            </div>
          )}
        </div>

        <Typography
          className="timestamp"
          color="text.secondary"
          variant="body2"
        >
          {formatFullDateTime(announcement.startTime)}{' '}
          {intl.formatMessage(translations.timeSeparator)} {renderUserLink()}
        </Typography>
        <Typography
          dangerouslySetInnerHTML={{ __html: announcement.content }}
          style={{ marginTop: 15, overflowWrap: 'anywhere' }}
          variant="body2"
        />
      </Paper>
      {showEditOptions && updateOperation && (
        <AnnouncementEdit
          announcementId={announcement.id}
          canSticky={canSticky}
          initialValues={initialValues}
          onClose={(): void => setIsOpen(false)}
          open={isOpen}
          updateOperation={updateOperation}
        />
      )}
    </>
  );
};

export default memo(injectIntl(AnnouncementCard), (prevProps, nextProps) => {
  return equal(prevProps.announcement, nextProps.announcement);
});
