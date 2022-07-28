import { FC, useEffect, useState } from 'react';
import { Grid } from '@mui/material';
import {
  CommentSettings,
  CommentTabTypes,
  CommentTopicEntity,
} from 'types/course/comments';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { toast } from 'react-toastify';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { fetchCommentData } from '../../operations';
import { getAllCommentTopicEntities, getTopicCount } from '../../selectors';
import TopicCard from '../cards/TopicCard';
import CommentPagination from '../paginations/CommentPagination';

interface Props extends WrappedComponentProps {
  tabValue: string;
  settings: CommentSettings;
  setCount: (count: number, type: CommentTabTypes) => void;
}

const translations = defineMessages({
  fetchTopicsFailure: {
    id: 'course.discussion.topics.TopicList.fetch.failure',
    defaultMessage: 'Failed to retrieve topics.',
  },
});

const TopicList: FC<Props> = (props) => {
  const { intl, tabValue, settings, setCount   } = props;
  const dispatch = useDispatch<AppDispatch>();
  const topicCountData = useSelector((state: AppState) => getTopicCount(state));
  const topicListData = useSelector((state: AppState) =>
    getAllCommentTopicEntities(state),
  );
  const [isLoading, setIsLoading] = useState(true);
  const [topicCount, setTopicCount] = useState(0);
  const [topicList, setTopicList] = useState(Array<CommentTopicEntity>());
  const [topicTabs, setTopicTabs] = useState({});
  const [page, setPage] = useState(1);

  const getData = (newTabValue: string, newPage: number): void => {
    if (topicTabs[newTabValue]?.[newPage] instanceof Set) {
      const topicIds: Set<number> = topicTabs[newTabValue][newPage];
      // set 0 index to topic count for pagination (pages start from 1)
      const topicCountSet: Set<number> = topicTabs[newTabValue][0];
      const newTopicListData = topicListData.filter(
        (topic: CommentTopicEntity) => topicIds.has(topic.id),
      );
      setTopicList(newTopicListData);
      setTopicCount(topicCountSet.keys().next().value);
    } else {
      setIsLoading(true);
      // unread is "pending" for students
      newTabValue =
        newTabValue === CommentTabTypes.UNREAD
          ? CommentTabTypes.PENDING
          : newTabValue;
      dispatch(fetchCommentData(newTabValue, newPage))
        .then((request) => {
          const newTopicList: CommentTopicEntity[] = {
            ...request.data.topicList,
          };
          setTopicList(newTopicList);
          const topicIds = new Set<number>();
          const topicKeys = Object.keys(newTopicList);
          if (topicKeys.length > 0) {
            topicKeys.forEach((key: string) =>
              topicIds.add(newTopicList[key].id),
            );
          }
          const arrayTopicIds: Set<number>[] = [
            ...(topicTabs[newTabValue] ?? []),
          ];
          arrayTopicIds[newPage] = topicIds;
          // set 0 index to topic count for pagination (pages start from 1)
          arrayTopicIds[0] = new Set<number>().add(request.data.topicCount);
          setTopicTabs({ ...topicTabs, [newTabValue]: arrayTopicIds });
          if (newTabValue !== CommentTabTypes.ALL && newTabValue !== CommentTabTypes.MY_STUDENTS) {
            setCount(request.data.topicCount, newTabValue as CommentTabTypes);
          }
        })
        .catch(() =>
          toast.error(intl.formatMessage(translations.fetchTopicsFailure)),
        )
        .finally(() => setIsLoading(false));
    }
  };

  useEffect(() => {
    setTopicCount(topicCountData);
  }, [topicCountData]);

  useEffect(() => {
    getData(tabValue, 1);
  }, [tabValue]);

  useEffect(() => {
    getData(tabValue, page);
  }, [page]);

  const updatePendingTab = (): void => {
    setTopicTabs({
      ...topicTabs,
      [CommentTabTypes.MY_STUDENTS_PENDING]: undefined,
      [CommentTabTypes.PENDING]: undefined,
    });
  };

  const updateReadTab = (): void => {
    setTopicTabs({ ...topicTabs, [CommentTabTypes.UNREAD]: undefined });
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  const renderPagination = (): JSX.Element => (
    <CommentPagination
      pageNum={page}
      topicCount={topicCount}
      topicsPerPage={settings.topicsPerPage}
      handlePageChange={(pageNumber: number): void => setPage(pageNumber)}
    />
  );

  return (
    <Grid container direction="column" columnSpacing={2} rowSpacing={2} style={{ marginTop: '0px' }}>
      {renderPagination()}
      {Object.keys(topicList).map((key: string) => (  
        <Grid item key={topicList[key].id} xs>
          <TopicCard
            topic={topicList[key]}
            updatePendingTab={updatePendingTab}
            updateReadTab={updateReadTab}
          />
        </Grid>
      ))}
      {renderPagination()}
    </Grid>
  );
};

export default injectIntl(TopicList);
