import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { toast } from 'react-toastify';
import { VideoSubmissionListData } from 'types/course/videoSubmissions';

import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import PageHeader from 'lib/components/navigation/PageHeader';

import UserVideoSubmissionTable from '../../components/tables/UserVideoSubmissionTable';
import { fetchVideoSubmissions } from '../../operations';

type Props = WrappedComponentProps;

const translations = defineMessages({
  videoSubmissionsHeader: {
    id: 'course.videoSubmissions.header',
    defaultMessage: 'Video Watch History',
  },
  fetchVideoSubmissionsFailure: {
    id: 'course.videoSubmissions.index.fetch.failure',
    defaultMessage: 'Failed to retrieve video submissions.',
  },
  toggleSuccess: {
    id: 'course.video.toggle.success',
    defaultMessage: 'Video was successfully updated.',
  },
  toggleFailure: {
    id: 'course.video.toggle.fail',
    defaultMessage: 'Failed to update the video.',
  },
});

const UserVideoSubmissionsIndex: FC<Props> = (props) => {
  const { intl } = props;
  const [isLoading, setIsLoading] = useState(true);
  const [videoSubmissions, setVideoSubmissions] = useState<
    VideoSubmissionListData[] | null
  >(null);

  useEffect(() => {
    setIsLoading(true);
    fetchVideoSubmissions()
      .then((response) => {
        setVideoSubmissions(response);
        setIsLoading(false);
      })
      .catch(() =>
        toast.error(
          intl.formatMessage(translations.fetchVideoSubmissionsFailure),
        ),
      );
  }, []);

  return (
    <>
      <PageHeader
        title={intl.formatMessage(translations.videoSubmissionsHeader)}
      />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <UserVideoSubmissionTable videoSubmissions={videoSubmissions} />
      )}
    </>
  );
};

export default injectIntl(UserVideoSubmissionsIndex);
