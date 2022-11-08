import { FC, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { VideoListData } from 'types/course/videos';
import { AppDispatch } from 'types/store';
import DeleteButton from 'lib/components/core/buttons/DeleteButton';
import EditButton from 'lib/components/core/buttons/EditButton';
import useTranslation from 'lib/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getVideosURL } from 'lib/helpers/url-builders';
import { deleteVideo } from '../../operations';
import VideoEdit from '../../pages/VideoEdit';

interface Props {
  video: VideoListData;
  navigateToIndex: boolean;
}

const translations = defineMessages({
  deletionSuccess: {
    id: 'course.video.buttons.delete.success',
    defaultMessage: '{title} has been successfully deleted.',
  },
  deletionFailure: {
    id: 'course.video.buttons.delete.fail',
    defaultMessage: 'Failed to delete {title}.',
  },
  deletionConfirm: {
    id: 'course.video.buttons.delete.confirm',
    defaultMessage: 'Are you sure you wish to delete the video "{title}"?',
  },
});

const VideoManagementButtons: FC<Props> = (props) => {
  const { video, navigateToIndex } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
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

  const managementButtons = (
    <div className="whitespace-nowrap">
      {video.permissions.canManage && (
        <>
          <EditButton
            className={`video-edit-${video.id}`}
            onClick={(): void => setIsEditing(true)}
          />
          {isEditing && (
            <VideoEdit
              open={isEditing}
              video={video}
              onClose={(): void => setIsEditing(false)}
            />
          )}
        </>
      )}
      {video.permissions.canManage && (
        <DeleteButton
          className={`video-delete-${video.id}`}
          disabled={isDeleting}
          onClick={onDelete}
          confirmMessage={t(translations.deletionConfirm, {
            title: video.title,
          })}
        />
      )}
    </div>
  );

  return managementButtons;
};

export default VideoManagementButtons;
