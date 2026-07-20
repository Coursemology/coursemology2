import { FC, lazy, Suspense, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import {
  CheckCircleOutline,
  PendingOutlined,
  ScheduleOutlined,
} from '@mui/icons-material';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import {
  CommentPostMiniEntity,
  CommentStatusTypes,
  CommentTopicEntity,
} from 'types/course/comments';

import Link from 'lib/components/core/Link';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import { getCourseUserURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import { updatePending, updateRead } from '../../operations';
import { getAllCommentPostMiniEntities } from '../../selectors';

import AiFeedbackCommentCard from './AiFeedbackCommentCard';
import CodaveriCommentCard from './CodaveriCommentCard';
import CommentCard from './CommentCard';

// An AI-generated feedback post still awaiting a staff decision -- shown with the rateable card.
const isRateableGeneratedDraft = (post: CommentPostMiniEntity): boolean =>
  Boolean(post.generatedRating) && post.workflowState === 'draft';

const CommentField = lazy(
  () =>
    import(
      /* webpackChunkName: "discussionComment" */ '../fields/CommentField'
    ),
);

interface TopicCardProps {
  topic: CommentTopicEntity;
}

const translations = defineMessages({
  byCreator: {
    id: 'course.discussion.topics.TopicCard.byCreator',
    defaultMessage: 'Created by <link>{creatorName}</link>',
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
  },
  loadingComment: {
    id: 'course.discussion.topics.TopicCard.loadingComment',
    defaultMessage: 'Loading comment field...',
  },
});

const TopicCard: FC<TopicCardProps> = (props) => {
  const { topic } = props;
  const { t } = useTranslation();

  const dispatch = useAppDispatch();
  const postListData = useAppSelector(getAllCommentPostMiniEntities).filter(
    (post) => post.topicId === topic.id,
  );
  const lastPost = postListData[postListData.length - 1];
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

  if (postListData.length === 0) {
    return null;
  }

  const onClickPending = (id: number): void => {
    if (status !== CommentStatusTypes.loading) {
      const newStatus =
        status === CommentStatusTypes.pending
          ? CommentStatusTypes.notPending
          : CommentStatusTypes.pending;
      setStatus(CommentStatusTypes.loading);
      dispatch(updatePending(id)).then(() => {
        setStatus(newStatus);
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
      });
    }
  };

  const updateStatus = (): void => {
    if (status === CommentStatusTypes.unread) {
      setStatus(CommentStatusTypes.read);
    } else if (status === CommentStatusTypes.pending) {
      setStatus(CommentStatusTypes.notPending);
    }
  };

  const renderStatus = (): JSX.Element | null => {
    switch (status) {
      case CommentStatusTypes.loading:
        return (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <PendingOutlined />
            {t(translations.loadingStatus)}
          </div>
        );
      case CommentStatusTypes.pending:
        return (
          <Link
            className="clickable"
            id={`mark-as-pending-${topic.id}`}
            onClick={(): void => onClickPending(topic.id)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <ScheduleOutlined />
            {t(translations.pendingStatus)}
          </Link>
        );
      case CommentStatusTypes.notPending:
        return (
          <Link
            className="clickable"
            id={`unmark-as-pending-${topic.id}`}
            onClick={(): void => onClickPending(topic.id)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <CheckCircleOutline />
            {t(translations.notPendingStatus)}
          </Link>
        );
      case CommentStatusTypes.read:
        return null;
      case CommentStatusTypes.unread:
        return (
          <Link
            className="clickable"
            id={`mark-as-read-${topic.id}`}
            onClick={(): void => onClickRead(topic.id)}
            style={{
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <CheckCircleOutline />
            {t(translations.unreadStatus)}
          </Link>
        );
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader
        style={{ paddingBottom: '0px' }}
        subheader={
          <div className="space-y-4">
            <Typography variant="body2">
              {t(translations.byCreator, {
                creatorName: topic.creator.name,
                link: (chunk) => (
                  <Link
                    to={getCourseUserURL(getCourseId(), topic.creator.id)}
                    underline="hover"
                  >
                    {chunk}
                  </Link>
                ),
              })}
            </Typography>

            {renderStatus()}
          </div>
        }
        title={
          <Link
            className={`topic-${topic.id}`}
            id={`topic-${topic.id}-${
              topic.timestamp?.toString().replaceAll(':', '-') ?? ''
            }`}
            to={topic.links.titleLink}
            underline="hover"
            variant="h6"
          >
            {topic.timestamp
              ? `${topic.title}: ${topic.timestamp.toString()}`
              : topic.title}
          </Link>
        }
      />
      <CardContent>
        {topic.content && <UserHTMLText html={topic.content} />}
        {postListData.map((post) => {
          const renderCard = (): JSX.Element => {
            if (post.codaveriFeedback?.status === 'pending_review') {
              return <CodaveriCommentCard post={post} />;
            }
            if (isRateableGeneratedDraft(post)) {
              return <AiFeedbackCommentCard post={post} />;
            }
            return <CommentCard post={post} />;
          };
          return <div key={post.id}>{renderCard()}</div>;
        })}
        {/* Dont need to render the comment field when the last post (which is the intended post to be shown)
          is a codaveri feedback or a still-pending AI-generated (rateable) feedback post. */}
        {!lastPost?.codaveriFeedback &&
          !(lastPost && isRateableGeneratedDraft(lastPost)) && (
            <Suspense
              fallback={
                <div
                  style={{
                    marginTop: 10,
                  }}
                >
                  {t(translations.loadingComment)}
                </div>
              }
            >
              <CommentField topic={topic} updateStatus={updateStatus} />
            </Suspense>
          )}
      </CardContent>
    </Card>
  );
};

export default TopicCard;
