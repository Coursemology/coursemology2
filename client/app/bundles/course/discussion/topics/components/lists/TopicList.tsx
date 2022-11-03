import { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import { CommentSettings, CommentTopicEntity } from 'types/course/comments';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import { defineMessages } from 'react-intl';
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
      <Grid item xs style={{ position: 'relative', width: '100%' }}>
        <Note message={t(translations.noTopic)} />
      </Grid>
    );
  }

  return (
    <>
      {Object.keys(topicList).map((key: string) => (
        <Grid
          item
          key={topicList[key].id}
          xs
          style={{ position: 'relative', width: '100%' }}
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
      rowCount={topicCount}
      rowsPerPage={settings.topicsPerPage}
      pageNum={pageNum}
      handlePageChange={handlePageChange}
    />
  );

  return (
    <Grid
      container
      direction="column"
      columnSpacing={2}
      rowSpacing={2}
      style={{ marginTop: '0px' }}
    >
      {renderPagination()}
      <TopicList topicList={topicList} listIsLoading={listIsLoading} />
      {topicList.length > 5 && !listIsLoading && renderPagination()}
    </Grid>
  );
};

export default TopicListWithPagination;
