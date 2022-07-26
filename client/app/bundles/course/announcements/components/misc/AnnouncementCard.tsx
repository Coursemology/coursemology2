import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC, useState, memo } from 'react';
import { AnnouncementMiniEntity } from 'types/course/announcements';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { toast } from 'react-toastify';
import equal from 'fast-deep-equal';

import { grey } from '@mui/material/colors';
import { Link } from '@mui/material';
import { DateRange, PushPin } from '@mui/icons-material';

import { getUserURL, getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getFullDateTime } from 'lib/helpers/timehelper';

import DeleteButton from 'lib/components/buttons/DeleteButton';
import EditButton from 'lib/components/buttons/EditButton';
import CustomTooltip from 'lib/components/CustomTooltip';

import { deleteAnnouncement } from '../../operations';
import AnnouncementEdit from '../../pages/AnnouncementEdit';

interface Props extends WrappedComponentProps {
  key: number;
  announcement: AnnouncementMiniEntity;
  showEditOptions?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.announcements.delete.success',
    defaultMessage: 'Announcement was successfully deleted.',
  },
  deletionFailure: {
    id: 'course.announcements.delete.failure',
    defaultMessage: 'Announcement could not be deleted.',
  },
  timeSeperator: {
    id: 'course.announcements.timeSeperator',
    defaultMessage: ' by ',
  },
  pinnedTooltip: {
    id: 'course.announcements.pinnedTooltip',
    defaultMessage: 'Pinned',
  },
  notInRangeTooltip: {
    id: 'course.announcements.notInRangeTooltip',
    defaultMessage: 'Out of date range',
  },
  deleteConfirmation: {
    id: 'course.announcements.deleteConfirmation',
    defaultMessage: 'Are you sure you want to delete the announcement',
  },
});

const AnnouncementCard: FC<Props> = (props) => {
  const { intl, key, announcement, showEditOptions } = props;

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

  const dispatch = useDispatch<AppDispatch>();
  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteAnnouncement(announcement.id))
      .then(() => {
        toast.success(intl.formatMessage(translations.deletionSuccess));
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      })
      .finally(() => setIsDeleting(false));
  };

  const onEdit = (): void => setIsOpen(true);

  const userLink = announcement.courseUserId
    ? getCourseUserURL(getCourseId(), announcement.courseUserId)
    : getUserURL(announcement.userId);

  const userName = announcement.courseUserName
    ? announcement.courseUserName
    : announcement.userName;

  const backgroundColor = announcement.isUnread ? '#ffe8e8' : '#ffffff';

  return (
    <>
      <div
        id={`announcement-${announcement.id}`}
        className="announcement"
        key={key}
        style={{
          borderStyle: 'solid',
          borderWidth: 0.2,
          borderColor: grey[300],
          borderRadius: 10,
          padding: 10,
          backgroundColor,
        }}
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
            <h3
              style={{
                marginTop: 0,
                marginBottom: 0,
                marginLeft:
                  announcement.isSticky || !announcement.isCurrentlyActive
                    ? 5
                    : 0,
                fontWeight: 'bold',
              }}
            >
              {announcement.title}
            </h3>
          </div>
          {showEditOptions && (
            <div style={{ display: 'flex' }}>
              {announcement.permissions.canEdit && (
                <EditButton
                  id={`announcement-edit-button-${announcement.id}`}
                  onClick={onEdit}
                  sx={{ paddingTop: 0, paddingBottom: 0, paddingRight: 0 }}
                />
              )}
              {announcement.permissions.canDelete && (
                <DeleteButton
                  id={`announcement-delete-button-${announcement.id}`}
                  disabled={isDeleting}
                  loading={isDeleting}
                  confirmMessage={`${intl.formatMessage(
                    translations.deleteConfirmation,
                  )} (${announcement.title})?`}
                  onClick={onDelete}
                  sx={{ paddingTop: 0, paddingBottom: 0 }}
                />
              )}
            </div>
          )}
        </div>

        <i className="timestamp">
          {getFullDateTime(announcement.startTime)}
          {intl.formatMessage(translations.timeSeperator)}
          <Link href={userLink} style={{ textDecoration: 'none' }}>
            {userName}
          </Link>
        </i>
        <div
          style={{ marginTop: 15 }}
          dangerouslySetInnerHTML={{ __html: announcement.content }}
        />
      </div>
      {showEditOptions && (
        <AnnouncementEdit
          open={isOpen}
          handleClose={(): void => setIsOpen(false)}
          announcementId={announcement.id}
          initialValues={initialValues}
        />
      )}
    </>
  );
};

export default memo(injectIntl(AnnouncementCard), (prevProps, nextProps) => {
  return equal(prevProps.announcement, nextProps.announcement);
});
