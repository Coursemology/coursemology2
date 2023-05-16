import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { VideoListData } from 'types/course/videos';

import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import { getVideosURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { deleteVideo } from '../../operations';
import VideoEdit from '../../pages/VideoEdit';

interface Props {
  video: VideoListData;
  navigateToIndex: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.video.VideoManagementButtons.deletionSuccess',
    defaultMessage: '{title} has been successfully deleted.',
  },
  deletionFailure: {
    id: 'course.video.VideoManagementButtons.deletionFailure',
    defaultMessage: 'Failed to delete {title}.',
  },
  deletionConfirm: {
    id: 'course.video.VideoManagementButtons.deletionConfirm',
    defaultMessage: 'Are you sure you wish to delete the video "{title}"?',
  },
});

const VideoManagementButtons: FC<Props> = (props) => {
  const { video, navigateToIndex } = props;
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const onDelete = (): Promise<void> => {
    setIsDeleting(true);
    return dispatch(deleteVideo(video.id))
      .then(() => {
        toast.success(
          t(translations.deletionSuccess, {
            title: video.title,
          }),
        );
        if (navigateToIndex) {
          navigate(`${getVideosURL(getCourseId())}?tab=${video.tabId}`);
        }
      })
      .catch((error) => {
        setIsDeleting(false);
        toast.error(
          t(translations.deletionFailure, {
            title: video.title,
          }),
        );
        throw error;
      });
  };

  return (
    <div className="whitespace-nowrap">
      {video.permissions.canManage && (
        <>
          <EditButton
            className={`video-edit-${video.id}`}
            onClick={(): void => setIsEditing(true)}
          />
          {isEditing && (
            <VideoEdit
              onClose={(): void => setIsEditing(false)}
              open={isEditing}
              video={video}
            />
          )}
        </>
      )}
      {video.permissions.canManage && (
        <DeleteButton
          className={`video-delete-${video.id}`}
          confirmMessage={t(translations.deletionConfirm, {
            title: video.title,
          })}
          disabled={isDeleting}
          onClick={onDelete}
        />
      )}
    </div>
  );
};

export default VideoManagementButtons;
