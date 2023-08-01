import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { VideoSubmissionListData } from 'types/course/videoSubmissions';

import Page from 'lib/components/core/layouts/Page';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import toast from 'lib/hooks/toast';

import UserVideoSubmissionTable from '../../components/tables/UserVideoSubmissionTable';
import { fetchVideoSubmissions } from '../../operations';

type Props = WrappedComponentProps;

const translations = defineMessages({
  videoSubmissionsHeader: {
    id: 'course.videoSubmissions.UserVideoSubmissionsIndex.videoSubmissionsHeader',
    defaultMessage: 'Video Watch History',
  },
  fetchVideoSubmissionsFailure: {
    id: 'course.videoSubmissions.UserVideoSubmissionsIndex.fetchVideoSubmissionsFailure',
    defaultMessage: 'Failed to retrieve video submissions.',
  },
  toggleSuccess: {
    id: 'course.videoSubmissions.UserVideoSubmissionsIndex.toggleSuccess',
    defaultMessage: 'Video was successfully updated.',
  },
  toggleFailure: {
    id: 'course.videoSubmissions.UserVideoSubmissionsIndex.toggleFailure',
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
    <Page
      title={intl.formatMessage(translations.videoSubmissionsHeader)}
      unpadded
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <UserVideoSubmissionTable videoSubmissions={videoSubmissions} />
      )}
    </Page>
  );
};

export default injectIntl(UserVideoSubmissionsIndex);
