import { Card, CardContent, CardHeader, Link, Tooltip } from '@mui/material';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import {
  CommentPostMiniEntity,
  CommentStatusTypes,
  CommentTopicEntity,
} from 'types/course/comments';
import { AppDispatch, AppState } from 'types/store';
import { updatePending, updateRead } from '../../operations';
import { getAllCommentPostMiniEntities } from '../../selectors';
import CommentCard from './CommentCard';
import CommentField from '../fields/CommentField';
import { CheckCircleOutline, PendingOutlined, ScheduleOutlined } from '@mui/icons-material';

interface Props extends WrappedComponentProps {
  topic: CommentTopicEntity;
  updatePendingTab: () => void;
  updateReadTab: () => void;
}

const translations = defineMessages({
  by: {
    id: 'course.discussion.topics.TopicCard.by',
    defaultMessage: 'By',
  },
  pendingStatus: {
    id: 'course.discussion.topics.TopicCard.pendingStatus',
    defaultMessage: 'Unmark as Pending',
  },
  notPendingStatus: {
    id: 'course.discussion.topics.TopicCard.notPendingStatus',
    defaultMessage: 'Mark as Pending',
  },
  unreadStatus: {
    id: 'course.discussion.topics.TopicCard.unreadStatus',
    defaultMessage: 'Mark as Read',
  },
  loadingStatus: {
    id: 'course.discussion.topics.TopicCard.loading',
    defaultMessage: 'Loading...',
  }
});

const TopicCard: FC<Props> = (props) => {
  const { intl, topic, updatePendingTab, updateReadTab } = props;
  const dispatch = useDispatch<AppDispatch>();
  const postListData = useSelector((state: AppState) =>
    getAllCommentPostMiniEntities(state),
  );
  const [status, setStatus] = useState(CommentStatusTypes.loading);

  useEffect(() => {
    if (topic.topicPermissions.canTogglePending) {
      const isPending = topic.topicSettings.isPending;
      const newStatus = isPending
        ? CommentStatusTypes.pending
        : CommentStatusTypes.notPending;
      setStatus(newStatus);
    } else if (topic.topicPermissions.canMarkAsRead) {
      const isUnread = topic.topicSettings.isUnread;
      const newStatus = isUnread
        ? CommentStatusTypes.unread
        : CommentStatusTypes.read;
      setStatus(newStatus);
    }
  }, [topic]);

  const onClickPending = (id: number): void => {
    if (status !== CommentStatusTypes.loading) {
      const newStatus =
        status === CommentStatusTypes.pending
          ? CommentStatusTypes.notPending
          : CommentStatusTypes.pending;
      setStatus(CommentStatusTypes.loading);
      dispatch(updatePending(id)).then(() => {
        setStatus(newStatus);
        updatePendingTab();
      });
    }
  };

  const onClickRead = (id: number): void => {
    if (status !== CommentStatusTypes.loading) {
      const newStatus =
        status === CommentStatusTypes.read
          ? CommentStatusTypes.unread
          : CommentStatusTypes.read;
      setStatus(CommentStatusTypes.loading);
      dispatch(updateRead(id)).then(() => {
        setStatus(newStatus);
        updateReadTab();
      });
    }
  };

  const updateStatus = () => {
    if (status == CommentStatusTypes.unread) {
      setStatus(CommentStatusTypes.read);
      updateReadTab();
    } else if (status == CommentStatusTypes.pending) {
      setStatus(CommentStatusTypes.notPending);
      updatePendingTab()
    }

  }

  const renderStatus = (): JSX.Element | null => {
    switch (status) {
      case CommentStatusTypes.loading:
        return (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap'
          }}>
            <PendingOutlined />
            {intl.formatMessage(translations.loadingStatus)}
          </div>
        );
      case CommentStatusTypes.pending:
        return (
          <Link
            className="clickable"
            onClick={(): void => onClickPending(topic.id)}
            style={{ cursor: 'pointer', 
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
            id={`mark-as-pending-${topic.id}`}
          >
            <ScheduleOutlined />
            {intl.formatMessage(translations.pendingStatus)}
          </Link>
        );
      case CommentStatusTypes.notPending:
        return (
          <Link
            className="clickable"
            onClick={(): void => onClickPending(topic.id)}
            style={{ cursor: 'pointer', 
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
            id={`unmark-as-pending-${topic.id}`}
          >
            <CheckCircleOutline />
            {intl.formatMessage(translations.notPendingStatus)}
          </Link>
        );
      case CommentStatusTypes.read:
        return <div />;
      case CommentStatusTypes.unread:
        return (
          <Tooltip title={intl.formatMessage(translations.unreadStatus)}>
            <Link
              className="clickable"
              onClick={(): void => onClickRead(topic.id)}
              style={{ cursor: 'pointer', 
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
              id={`mark-as-read-${topic.id}`}
            >
              <CheckCircleOutline />
              {intl.formatMessage(translations.unreadStatus)}
            </Link>
          </Tooltip>

        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader
        title={<a 
          href={topic.links.titleLink}
          className={`topic-${topic.id}`}
          id={`topic-${topic.id}-${topic.timestamp?.toString().replaceAll(':', '-') ?? ''}`}
          >
            {topic.title}
          </a>
        }
        subheader={
          <>
            <div>
              {renderStatus()}
            </div>
            <div>
              {`${intl.formatMessage(translations.by)}: `}
              <a href={getCourseUserURL(getCourseId(), topic.creator.id)}>
                {topic.creator.name}
              </a>
            </div>
          </>

        }
        style={{ paddingBottom: '0px' }}
      />
      <CardContent>
        {postListData
          .filter((post: CommentPostMiniEntity) => post.topicId === topic.id)
          .map((post: CommentPostMiniEntity) => {
            return (
              <div key={post.id}>
                <CommentCard post={post} />
              </div>
            );
          })}
        <CommentField topic={topic} updateStatus={updateStatus} />
      </CardContent>
    </Card>
  );
};

export default injectIntl(TopicCard);
