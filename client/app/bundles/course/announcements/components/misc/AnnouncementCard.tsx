import { FC, memo, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { DateRange, PushPin } from '@mui/icons-material';
import { Link } from '@mui/material';
import { grey } from '@mui/material/colors';
import equal from 'fast-deep-equal';
import {
  AnnouncementFormData,
  AnnouncementMiniEntity,
} from 'types/course/announcements';
import { AppDispatch, Operation } from 'types/store';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import CustomTooltip from 'lib/components/core/CustomTooltip';
import { getCourseUserURL, getUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { formatFullDateTime } from 'lib/moment';

import AnnouncementEdit from '../../pages/AnnouncementEdit';

interface Props extends WrappedComponentProps {
  key: number;
  announcement: AnnouncementMiniEntity;
  showEditOptions?: boolean;
  updateOperation?: (
    announcementId: number,
    formData: AnnouncementFormData,
  ) => Operation<void>;
  deleteOperation?: (announcementId: number) => Operation<void>;
  canSticky?: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.announcements.delete.success',
    defaultMessage: 'Announcement was successfully deleted.',
  },
  deletionFailure: {
    id: 'course.announcements.delete.failure',
    defaultMessage: 'Announcement could not be deleted - {error}',
  },
  timeSeparator: {
    id: 'course.announcements.timeSeparator',
    defaultMessage: 'by',
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
  const {
    intl,
    key,
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

  const dispatch = useDispatch<AppDispatch>();
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

  const userName = announcement.courseUserName
    ? announcement.courseUserName
    : announcement.userName;

  const renderUserLink = (): JSX.Element => {
    const userLink = announcement.courseUserId
      ? getCourseUserURL(getCourseId(), announcement.courseUserId)
      : getUserURL(announcement.userId);

    if (announcement.userId === -1) {
      return <span>{userName}</span>;
    }
    return (
      <Link href={userLink} style={{ textDecoration: 'none' }}>
        {userName}
      </Link>
    );
  };

  const backgroundColor = announcement.isUnread ? '#ffe8e8' : '#ffffff';

  return (
    <>
      <div
        key={key}
        className="announcement"
        id={`announcement-${announcement.id}`}
        style={{
          borderStyle: 'solid',
          borderWidth: 0.2,
          borderColor: grey[300],
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
                overflowWrap: 'anywhere',
              }}
            >
              {announcement.title}
            </h3>
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

        <em className="timestamp">
          {formatFullDateTime(announcement.startTime)}{' '}
          {intl.formatMessage(translations.timeSeparator)} {renderUserLink()}
        </em>
        <div
          dangerouslySetInnerHTML={{ __html: announcement.content }}
          style={{ marginTop: 15, overflowWrap: 'anywhere' }}
        />
      </div>
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
