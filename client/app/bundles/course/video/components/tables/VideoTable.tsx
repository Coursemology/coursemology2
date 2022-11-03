import { FC, memo } from 'react';
import { Switch } from '@mui/material';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import equal from 'fast-deep-equal';
import DataTable from 'lib/components/core/layouts/DataTable';
import { VideoListData, VideoPermissions } from 'types/course/videos';
import LinearProgressWithLabel from 'lib/components/core/LinearProgressWithLabel';
import Note from 'lib/components/core/Note';
import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import PersonalTimeBooleanIcon from 'lib/components/extensions/PersonalTimeBooleanIcon';
import { getCourseId } from 'lib/helpers/url-helpers';
import { getVideoSubmissionsURL, getVideoURL } from 'lib/helpers/url-builders';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { AppState } from 'types/store';
import VideoManagementButtons from '../buttons/VideoManagementButtons';
import { getVideoMetadata } from '../../selectors';
import WatchVideoButton from '../buttons/WatchVideoButton';

interface Props extends WrappedComponentProps {
  videos: VideoListData[];
  permissions: VideoPermissions | null;
  onTogglePublished: (videoId: number, data: boolean) => void;
}

const translations = defineMessages({
  noVideo: {
    id: 'course.video.tables.VideoTable.noVideo',
    defaultMessage: 'No Video',
  },
});

const VideoTable: FC<Props> = (props) => {
  const { videos, permissions, onTogglePublished, intl } = props;
  const videoMetadata = useSelector((state: AppState) =>
    getVideoMetadata(state),
  );

  if (videos && videos.length === 0) {
    return <Note message={intl.formatMessage(translations.noVideo)} />;
  }

  const options: TableOptions = {
    download: false,
    filter: false,
    pagination: false,
    print: false,
    search: false,
    selectableRows: 'none',
    setRowProps: (_row, dataIndex, _rowIndex) => {
      const video = videos[dataIndex];
      let backgroundColor: string = '';
      if (
        (video.startTimeInfo.referenceTime &&
          Date.parse(video.startTimeInfo.referenceTime) > Date.now()) ||
        !video.published
      ) {
        backgroundColor = 'bg-gray-200';
      }
      return {
        className: `video_${videos[dataIndex].id} ${backgroundColor}`,
      };
    },
    viewColumns: false,
  };

  const columns: TableColumns[] = [
    {
      name: 'title',
      label: 'Title',
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const video = videos[dataIndex];

          return (
            <div className="flex items-center">
              {(videoMetadata.isCurrentCourseUser &&
                !videoMetadata.isStudent) ||
                (videoMetadata.timelineAlgorithm &&
                  videoMetadata.timelineAlgorithm !== 'fixed' && (
                    <PersonalTimeBooleanIcon
                      showPersonalizedTimelineFeatures={
                        videoMetadata.showPersonalizedTimelineFeatures
                      }
                      hasPersonalTimes={video.hasPersonalTimes}
                      affectsPersonalTimes={video.affectsPersonalTimes}
                    />
                  ))}
              <Link key={video.id} to={getVideoURL(getCourseId(), video.id)}>
                {video.title}
              </Link>
            </div>
          );
        },
      },
    },
    {
      name: 'startTimeInfo',
      label: 'Start At',
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const video = videos[dataIndex];
          return <PersonalStartEndTime timeInfo={video.startTimeInfo} />;
        },
      },
    },
    {
      name: 'id',
      label: ' ',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const video = videos[dataIndex];
          return <WatchVideoButton video={video} />;
        },
      },
    },
  ];

  if (permissions?.canAnalyze) {
    columns.push({
      name: 'watchCount',
      label: 'Watch Count',
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        hideInSmallScreen: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const video = videos[dataIndex];
          const watchCount = video.watchCount;
          if (watchCount === 0) {
            return (
              <span>
                {watchCount} / {videoMetadata.studentsCount}
              </span>
            );
          }
          return (
            <Link to={getVideoSubmissionsURL(getCourseId(), video.id)}>
              {watchCount} / {videoMetadata.studentsCount}
            </Link>
          );
        },
      },
    });
    columns.push({
      name: 'percentWatched',
      label: 'Average % Watched',
      options: {
        filter: false,
        sort: false,
        alignCenter: false,
        hideInSmallScreen: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const video = videos[dataIndex];
          const percentWatched = video.percentWatched!;
          return <LinearProgressWithLabel value={percentWatched} />;
        },
      },
    });
  }

  if (permissions?.canManage) {
    columns.push({
      name: 'published',
      label: 'Published',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        hideInSmallScreen: true,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const videoId = videos[dataIndex].id;
          const isPublished = videos[dataIndex].published;
          return (
            <Switch
              key={videoId}
              checked={isPublished}
              color="primary"
              onChange={(_, checked): void =>
                onTogglePublished(videoId, checked)
              }
            />
          );
        },
      },
    });
    columns.push({
      name: 'id',
      label: 'Actions',
      options: {
        filter: false,
        sort: false,
        alignCenter: true,
        hideInSmallScreen: true,
        customBodyRenderLite: (dataIndex) => {
          const video = videos[dataIndex];
          return (
            <VideoManagementButtons video={video} navigateToIndex={false} />
          );
        },
      },
    });
  }

  return (
    <DataTable data={videos} columns={columns} options={options} withMargin />
  );
};

export default memo(injectIntl(VideoTable), (prevProps, nextProps) => {
  return equal(prevProps.videos, nextProps.videos);
});
