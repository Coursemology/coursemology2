import { memo, useEffect, useState } from 'react';
import { Card, CardContent } from '@mui/material';
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';

import CourseAPI from 'api/course';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import StoreProvider from 'lib/components/wrappers/StoreProvider';

import Submission from '../../containers/Submission';
import storeCreator from '../../store';

const SubmissionEditWithStore = ({ data }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [editVideoData, setEditVideoData] = useState(data);

  useEffect(() => {
    // The logic below follows the commit below
    // https://github.com/Coursemology/coursemology2/pull/2864/commits/860a6c7a021994e394fc41a9d030054fce663a2c
    // in this PR - https://github.com/Coursemology/coursemology2/pull/2864
    if (editVideoData.enableMonitoring) {
      CourseAPI.video.sessions
        .create()
        .then((response) => {
          setEditVideoData({
            ...editVideoData,
            video: { ...editVideoData.video, sessionId: response.data.id },
          });
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  if (isLoading) return <LoadingIndicator />;

  return (
    <div id="video-component">
      <StoreProvider {...storeCreator(editVideoData)}>
        <Card className="mt-6">
          <CardContent>
            <Submission />
          </CardContent>
        </Card>
      </StoreProvider>
    </div>
  );
};

SubmissionEditWithStore.propTypes = {
  data: PropTypes.object.isRequired,
};

export default memo(SubmissionEditWithStore, (prevProps, nextProps) =>
  equal(prevProps, nextProps),
);
