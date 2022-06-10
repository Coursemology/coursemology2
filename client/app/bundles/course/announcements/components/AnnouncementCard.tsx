import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { FC } from 'react';
import { AnnouncementMiniEntity } from 'types/course/announcements';

import {
  getUserURL,
  getCourseUserURL,
  getCourseAnnouncementURL,
  getCourseURL,
} from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { grey } from '@mui/material/colors';
import DeleteButton from 'lib/components/buttons/DeleteButton';
import EditButton from 'lib/components/buttons/EditButton';
import { useDispatch } from 'react-redux';
import { AppDispatch } from 'types/store';
import { toast } from 'react-toastify';
import { Link } from '@mui/material';
import { DateRange, PushPin } from '@mui/icons-material';
import { getFullDateTime } from 'lib/helpers/timehelper';
import { deleteAnnouncement } from '../operations';

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
});

const AnnouncementCard: FC<Props> = (props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { intl, key, announcement, showEditOptions } = props;

  const onDelete = (): Promise<void> => {
    return dispatch(deleteAnnouncement(announcement.id))
      .then(() => {
        // There is currently a rails success message, uncomment this when announcements is refactored
        // toast.success(intl.formatMessage(translations.deletionSuccess));
        window.location.href = `${getCourseURL(getCourseId())}/announcements`;
      })
      .catch((error) => {
        toast.error(intl.formatMessage(translations.deletionFailure));
        throw error;
      });
  };

  const onEdit = (): void => {
    window.location.href = `${getCourseAnnouncementURL(
      getCourseId(),
      announcement.id,
    )}/edit`;
  };

  const userLink = announcement.courseUserId
    ? getCourseUserURL(getCourseId(), announcement.courseUserId)
    : getUserURL(announcement.userId);

  const userName = announcement.courseUserName
    ? announcement.courseUserName
    : announcement.userName;

  const backgroundColor = announcement.isUnread ? '#ffe8e8' : '#ffffff';

  return (
    <div
      id={`announcement-${announcement.id}`}
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
            <PushPin fontSize="small" style={{ marginTop: 3 }} />
          )}
          {!announcement.isCurrentlyActive && (
            <DateRange fontSize="small" style={{ marginTop: 3 }} />
          )}
          <h3 style={{ marginTop: 0, marginBottom: 10, fontWeight: 'bold' }}>
            {announcement.title}
          </h3>
        </div>
        {showEditOptions && (
          <div style={{ display: 'flex' }}>
            {announcement.permissions.canEdit && (
              <EditButton onClick={onEdit} />
            )}
            {announcement.permissions.canDelete && (
              <DeleteButton
                disabled={false}
                confirmMessage={`Are you sure you want to delete the Announcement (${announcement.title})?`}
                onClick={onDelete}
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
  );
};

export default injectIntl(AnnouncementCard);
