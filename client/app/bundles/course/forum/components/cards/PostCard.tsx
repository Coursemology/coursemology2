import { FC, useEffect, useState } from 'react';
import {
  Avatar,
  CardContent,
  CardHeader,
  Divider,
  Link,
  Typography,
  Card,
  CardActions,
  Button,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import { scroller, Element } from 'react-scroll';
import { AppState, AppDispatch } from 'types/store';
import { useSelector, useDispatch } from 'react-redux';
import { formatLongDateTime } from 'lib/moment';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';

import { defineMessages } from 'react-intl';
import { toast } from 'react-toastify';
import formTranslations from 'lib/translations/form';
import useTranslation from 'lib/hooks/useTranslation';
import { getForumTopic, getForumTopicPost } from '../../selectors';
import ForumTopicPostManagementButtons from '../buttons/ForumTopicPostManagementButtons';
import {
  createForumTopicPost,
  toggleForumTopicPostAnswer,
  updateForumTopicPost,
  voteTopicPost,
} from '../../operations';
import MarkAnswerButton from '../buttons/MarkAnswerButton';
import VotePostButton from '../buttons/VotePostButton';

interface Props {
  postId: number;
  level: number;
}

const translations = defineMessages({
  updateSuccess: {
    id: 'course.forum.topic.post.update.success',
    defaultMessage: 'The post has been updated.',
  },
  updateFailure: {
    id: 'course.forum.topic.post.update.fail',
    defaultMessage: 'Failed to update the post - {error}',
  },
  replySuccess: {
    id: 'course.forum.topic.post.reply.success',
    defaultMessage: 'The reply post has been created.',
  },
  replyFailure: {
    id: 'course.forum.topic.post.reply.fail',
    defaultMessage: 'Failed to submit the post - {error}',
  },
  emptyPost: {
    id: 'course.forum.topic.post.emptyPost',
    defaultMessage: 'Post cannot be empty!',
  },
});

const postClassName = (isUnread: boolean, isSolution: boolean): string => {
  if (isUnread) return 'space-y-4 bg-red-100';
  if (isSolution) return 'space-y-4 bg-green-100';
  return 'space-y-4';
};

const PostCard: FC<Props> = (props) => {
  const { postId, level } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [replyValue, setReplyValue] = useState('');
  const { t } = useTranslation();
  const post = useSelector((state: AppState) =>
    getForumTopicPost(state, postId),
  );
  const topic = useSelector((state: AppState) =>
    getForumTopic(state, post?.topicId),
  );
  const { forumId: forumIdSlug, topicId: topicIdSlug } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    if (isReplying) {
      scroller.scrollTo(`postReplyElement_${postId}`, {
        duration: 200,
        smooth: true,
        offset: -400,
      });
    }
  }, [isReplying]);

  const handleUpdate = (): void => {
    dispatch(updateForumTopicPost(post?.postUrl!, editValue))
      .then(() => {
        toast.success(t(translations.updateSuccess));
        setIsEditing(false);
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  const handleSaveUpdate = (): void => {
    if (editValue.trim() === '') {
      toast.error(t(translations.emptyPost));
      return;
    }
    if (post && editValue === post.text) {
      setIsEditing(false);
    } else {
      handleUpdate();
    }
  };

  const handleReply = (): void => {
    if (replyValue.trim() === '') {
      toast.error(t(translations.emptyPost));
      return;
    }
    dispatch(
      createForumTopicPost(forumIdSlug!, topicIdSlug!, replyValue, postId),
    )
      .then((response) => {
        toast.success(t(translations.replySuccess));
        setIsReplying(false);
        setReplyValue('');
        scroller.scrollTo(`postElement_${response.postId}`, {
          duration: 200,
          smooth: true,
          offset: -400,
        });
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.replyFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  const handleMarkAnswer = (): void => {
    dispatch(toggleForumTopicPostAnswer(post?.postUrl!, topic?.id!, postId))
      .then(() => {
        toast.success(t(translations.updateSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  const handleVotePost = (voteNum: -1 | 0 | 1): void => {
    dispatch(voteTopicPost(post?.postUrl!, voteNum))
      .then(() => {
        toast.success(t(translations.updateSuccess));
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.errors
          ? error.response.data.errors
          : '';
        toast.error(
          t(translations.updateFailure, {
            error: errorMessage,
          }),
        );
      });
  };

  if (!post) return null;

  return (
    <Element name={`postElement_${post.id}`}>
      <div
        className={`post_${post.id}`}
        style={{ marginLeft: 0 + Math.min(3, level - 1) * 25 }}
      >
        <Card className={postClassName(post.isUnread, post.isAnswer)}>
          <CardHeader
            className="pb-0"
            avatar={
              <Avatar
                className="h-20 w-20"
                src={post.creator.imageUrl}
                alt={post.creator.name}
                component={Link}
                href={post.creator.userUrl}
              />
            }
            action={
              <ForumTopicPostManagementButtons
                post={post}
                handleEdit={(): void => {
                  setIsEditing((prevState) => !prevState);
                  setEditValue(post.text);
                }}
                handleReply={(): void => {
                  setIsReplying((prevState) => !prevState);
                }}
              />
            }
            title={<a href={post.creator.userUrl}>{post.creator.name}</a>}
            titleTypographyProps={{ variant: 'body1' }}
            subheader={formatLongDateTime(post.createdAt)}
            subheaderTypographyProps={{ variant: 'body1' }}
          />
          <Divider />
          <CardContent className="py-2">
            {isEditing ? (
              <CKEditorRichText
                name={`postEditText_${postId}`}
                inputId={postId.toString()}
                onChange={(nextValue): void => setEditValue(nextValue)}
                value={editValue}
                disableMargins
              />
            ) : (
              <Typography
                className="text-2xl"
                dangerouslySetInnerHTML={{ __html: post.text }}
              />
            )}
          </CardContent>
          <CardActions className="pt-0">
            {isEditing ? (
              <>
                <Button
                  color="secondary"
                  onClick={(): void => setIsEditing(false)}
                  id={`post_${postId}`}
                  className="cancel-edit-button"
                >
                  {t(formTranslations.cancel)}
                </Button>
                <Button
                  color="primary"
                  onClick={handleSaveUpdate}
                  id={`post_${post.id}`}
                  className="save-button"
                >
                  {t(formTranslations.save)}
                </Button>
              </>
            ) : (
              <>
                <VotePostButton post={post} handleClick={handleVotePost} />
                <MarkAnswerButton
                  topic={topic}
                  handleClick={handleMarkAnswer}
                  isAnswer={post.isAnswer}
                />
              </>
            )}
          </CardActions>
        </Card>
        {isReplying && (
          <Element name={`postReplyElement_${postId}`}>
            <Card className="ml-20 mt-4">
              <CardContent className="pb-0">
                <CKEditorRichText
                  name={`postReplyText_${postId}`}
                  inputId={postId.toString()}
                  onChange={(nextValue): void => setReplyValue(nextValue)}
                  value={replyValue}
                  placeholder={`Reply to ${post.creator.name}`}
                  disableMargins
                  autofocus
                />
              </CardContent>
              <CardActions className="pt-0">
                <Button
                  color="secondary"
                  onClick={(): void => setIsReplying(false)}
                  id={`post_${postId}`}
                  className="cancel-reply-button"
                >
                  {t(formTranslations.cancel)}
                </Button>
                <Button
                  color="primary"
                  onClick={handleReply}
                  id={`post_${post.id}`}
                  className="reply-button"
                >
                  {t(formTranslations.reply)}
                </Button>
              </CardActions>
            </Card>
          </Element>
        )}
      </div>
    </Element>
  );
};

export default PostCard;
