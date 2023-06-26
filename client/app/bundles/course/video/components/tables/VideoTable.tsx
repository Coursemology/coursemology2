import { FC, memo } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { Switch } from '@mui/material';
import equal from 'fast-deep-equal';
import { TableColumns, TableOptions } from 'types/components/DataTable';
import { VideoListData, VideoPermissions } from 'types/course/videos';

import DataTable from 'lib/components/core/layouts/DataTable';
import LinearProgressWithLabel from 'lib/components/core/LinearProgressWithLabel';
import Link from 'lib/components/core/Link';
import Note from 'lib/components/core/Note';
import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import { getVideoSubmissionsURL, getVideoURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppSelector } from 'lib/hooks/store';

import { getVideoMetadata } from '../../selectors';
import VideoManagementButtons from '../buttons/VideoManagementButtons';
import WatchVideoButton from '../buttons/WatchVideoButton';
import VideoBadges from '../misc/VideoBadges';

interface Props extends WrappedComponentProps {
  videos: VideoListData[];
  permissions: VideoPermissions | null;
  onTogglePublished: (videoId: number, data: boolean) => void;
}

const translations = defineMessages({
  noVideo: {
    id: 'course.video.VideoTable.noVideo',
    defaultMessage: 'No Video',
  },
});

const VideoTable: FC<Props> = (props) => {
  const { videos, permissions, onTogglePublished, intl } = props;
  const videoMetadata = useAppSelector(getVideoMetadata);

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
    sortOrder: {
      name: 'startTimeInfo',
      direction: 'asc',
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
            <div className="flex flex-col items-start justify-between xl:flex-row xl:items-center">
              <label className="m-0 font-normal" title={video.title}>
                <Link // TODO: Change to lg:line-clamp-1 once the current sidebar is gone
                  key={video.id}
                  className="line-clamp-2 xl:line-clamp-1"
                  to={getVideoURL(getCourseId(), video.id)}
                >
                  {video.title}
                </Link>
              </label>
              <VideoBadges for={video} metadata={videoMetadata} />
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
        sort: true,
        alignCenter: false,
        customBodyRenderLite: (dataIndex): JSX.Element => {
          const video = videos[dataIndex];
          return <PersonalStartEndTime timeInfo={video.startTimeInfo} />;
        },
        sortCompare: (order: string) => {
          return (value1, value2) => {
            const latestPost1 = value1.data as VideoListData['startTimeInfo'];
            const latestPost2 = value2.data as VideoListData['startTimeInfo'];
            const date1 = new Date(latestPost1.referenceTime!);
            const date2 = new Date(latestPost2.referenceTime!);
            return (
              (date1.getTime() - date2.getTime()) * (order === 'asc' ? 1 : -1)
            );
          };
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
            <VideoManagementButtons navigateToIndex={false} video={video} />
          );
        },
      },
    });
  }

  return (
    <DataTable columns={columns} data={videos} options={options} withMargin />
  );
};

export default memo(injectIntl(VideoTable), (prevProps, nextProps) => {
  return equal(prevProps.videos, nextProps.videos);
});
