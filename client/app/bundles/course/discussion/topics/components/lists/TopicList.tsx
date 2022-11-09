import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Grid } from '@mui/material';
import { CommentSettings, CommentTopicEntity } from 'types/course/comments';
import { AppDispatch, AppState } from 'types/store';

import BackendPagination from 'lib/components/core/layouts/BackendPagination';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import Note from 'lib/components/core/Note';
import useTranslation from 'lib/hooks/useTranslation';

import { fetchCommentData } from '../../operations';
import { getAllCommentTopicEntities, getTopicCount } from '../../selectors';
import TopicCard from '../cards/TopicCard';

interface Props {
  tabValue: string;
  settings: CommentSettings;
}

interface TopicListProps {
  listIsLoading: boolean;
  topicList: CommentTopicEntity[];
}

const translations = defineMessages({
  fetchTopicsFailure: {
    id: 'course.discussion.topics.TopicList.fetch.failure',
    defaultMessage: 'Failed to retrieve topics.',
  },
  noTopic: {
    id: 'course.discussion.topics.TopicList.fetch.noTopic',
    defaultMessage:
      'Congrats! There is currently no pending/existing comments!',
  },
});

const TopicList: FC<TopicListProps> = (props) => {
  const { listIsLoading, topicList } = props;
  const { t } = useTranslation();

  if (listIsLoading) {
    return <LoadingIndicator />;
  }

  if (topicList.length === 0) {
    return (
      <Grid
        item={true}
        style={{ position: 'relative', width: '100%' }}
        xs={true}
      >
        <Note message={t(translations.noTopic)} />
      </Grid>
    );
  }

  return (
    <>
      {Object.keys(topicList).map((key: string) => (
        <Grid
          key={topicList[key].id}
          item={true}
          style={{ position: 'relative', width: '100%' }}
          xs={true}
        >
          <TopicCard topic={topicList[key]} />
        </Grid>
      ))}
    </>
  );
};

const TopicListWithPagination: FC<Props> = (props) => {
  const { settings, tabValue } = props;
  const dispatch = useDispatch<AppDispatch>();
  const { t } = useTranslation();

  const [pageNum, setPageNum] = useState(1);
  const [listIsLoading, setListIsLoading] = useState(false);
  const [pageIsLoading, setPageIsLoading] = useState(true);

  const topicCount = useSelector((state: AppState) => getTopicCount(state));
  const topicList = useSelector((state: AppState) =>
    getAllCommentTopicEntities(state),
  );

  useEffect(() => {
    dispatch(fetchCommentData(tabValue, pageNum))
      .catch(() => toast.error(t(translations.fetchTopicsFailure)))
      .finally(() => {
        setPageIsLoading(false);
      });
  }, [dispatch]);

  if (pageIsLoading) {
    return <LoadingIndicator />;
  }

  const handlePageChange = (newPageNumber: number): void => {
    setListIsLoading(true);
    setPageNum(newPageNumber);
    dispatch(fetchCommentData(tabValue, newPageNumber))
      .catch(() => {
        toast.error(t(translations.fetchTopicsFailure));
      })
      .finally(() => setListIsLoading(false));
  };

  const renderPagination = (): JSX.Element => (
    <BackendPagination
      handlePageChange={handlePageChange}
      pageNum={pageNum}
      rowCount={topicCount}
      rowsPerPage={settings.topicsPerPage}
    />
  );

  return (
    <Grid
      columnSpacing={2}
      container={true}
      direction="column"
      rowSpacing={2}
      style={{ marginTop: '0px' }}
    >
      {renderPagination()}
      <TopicList listIsLoading={listIsLoading} topicList={topicList} />
      {topicList.length > 5 && !listIsLoading && renderPagination()}
    </Grid>
  );
};

export default TopicListWithPagination;
