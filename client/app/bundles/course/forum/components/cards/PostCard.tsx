import { FC, useEffect, useState } from 'react';
import { defineMessages } from 'react-intl';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Element, scroller } from 'react-scroll';
import { toast } from 'react-toastify';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  IconButton,
  Link,
  Typography,
} from '@mui/material';
import {
  ForumTopicPostEntity,
  ForumTopicPostFormData,
} from 'types/course/forums';
import { AppDispatch, AppState } from 'types/store';

import Checkbox from 'lib/components/core/buttons/Checkbox';
import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';
import formTranslations from 'lib/translations/form';

import {
  createForumTopicPost,
  toggleForumTopicPostAnswer,
  updateForumTopicPost,
  voteTopicPost,
} from '../../operations';
import { getForumTopic, getForumTopicPost } from '../../selectors';
import ForumTopicPostManagementButtons from '../buttons/ForumTopicPostManagementButtons';
import MarkAnswerButton from '../buttons/MarkAnswerButton';
import VotePostButton from '../buttons/VotePostButton';

interface Props {
  postId: number;
  level: number;
}

interface PostCreatorReturnValues {
  avatar: JSX.Element | null;
  creatorName: string;
  creatorUrl: string | null;
  visibilityIcon: JSX.Element | null;
}

const translations = defineMessages({
  updateSuccess: {
    id: 'course.forum.PostCard.updateSuccess',
    defaultMessage: 'The post has been updated.',
  },
  updateFailure: {
    id: 'course.forum.PostCard.updateFailure',
    defaultMessage: 'Failed to update the post - {error}',
  },
  replySuccess: {
    id: 'course.forum.PostCard.replySuccess',
    defaultMessage: 'The reply post has been created.',
  },
  replyFailure: {
    id: 'course.forum.PostCard.replyFailure',
    defaultMessage: 'Failed to submit the post - {error}',
  },
  emptyPost: {
    id: 'course.forum.PostCard.emptyPost',
    defaultMessage: 'Post cannot be empty!',
  },
  replyTo: {
    id: 'course.forum.PostCard.replyTo',
    defaultMessage: 'Reply to {user}',
  },
  postAnonymously: {
    id: 'course.forum.PostCard.postAnonymously',
    defaultMessage: 'Anonymous post',
  },
  anonymousUser: {
    id: 'course.forum.PostCard.anonymousUser',
    defaultMessage: 'Anonymous User',
  },
  maskUser: {
    id: 'course.forum.PostCard.maskUser',
    defaultMessage: 'Mask User',
  },
  unmaskUser: {
    id: 'course.forum.PostCard.unmaskUser',
    defaultMessage: 'Unmask User',
  },
});

const postClassName = (isUnread: boolean, isSolution: boolean): string => {
  if (isUnread) return 'space-y-4 bg-red-100';
  if (isSolution) return 'space-y-4 bg-green-100';
  return 'space-y-4';
};

const PostCreator = (post?: ForumTopicPostEntity): PostCreatorReturnValues => {
  const { t } = useTranslation();
  const [hideAvatar, setHideAvatar] = useState(true);

  let postCreatorData: PostCreatorReturnValues = {
    avatar: null,
    creatorName: '',
    creatorUrl: null,
    visibilityIcon: null,
  };

  if (!post) return postCreatorData;

  const {
    isAnonymous,
    creator,
    permissions: { canViewAnonymous, isAnonymousEnabled },
  } = post;
  const canAccessAnonymous =
    isAnonymousEnabled && canViewAnonymous && isAnonymous;

  // Either a post is not anonymous or anonymous forum setting is disabled
  if ((!isAnonymousEnabled || !isAnonymous) && creator) {
    postCreatorData = {
      avatar: (
        <Avatar
          alt={creator.name}
          className="h-20 w-20"
          component={Link}
          href={creator.userUrl}
          src={creator.imageUrl}
        />
      ),
      creatorName: creator.name,
      creatorUrl: creator.userUrl,
      visibilityIcon: null,
    };
  } else if (canAccessAnonymous && creator && !hideAvatar) {
    // If someone can see the real identity of the anonymous post
    postCreatorData = {
      avatar: (
        <Avatar
          alt={creator.name}
          className="h-20 w-20"
          component={Link}
          href={creator.userUrl}
          src={creator.imageUrl}
        />
      ),
      creatorName: creator.name,
      creatorUrl: creator.userUrl,
      visibilityIcon: (
        <IconButton
          edge="end"
          onClick={(): void => setHideAvatar(true)}
          onMouseDown={(e): void => e.preventDefault()}
          title={t(translations.maskUser)}
        >
          <VisibilityOff />
        </IconButton>
      ),
    };
  } else {
    postCreatorData = {
      avatar: <Avatar className="h-20 w-20">?</Avatar>,
      creatorName: t(translations.anonymousUser),
      creatorUrl: null,
      visibilityIcon: canAccessAnonymous ? (
        <IconButton
          edge="end"
          onClick={(): void => setHideAvatar(false)}
          onMouseDown={(e): void => e.preventDefault()}
          title={t(translations.unmaskUser)}
        >
          <Visibility />
        </IconButton>
      ) : null,
    };
  }

  return postCreatorData;
};

const PostCard: FC<Props> = (props) => {
  const { postId, level } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [replyValue, setReplyValue] = useState({
    text: '',
    isAnonymous: false,
  });
  const { t } = useTranslation();
  const post = useSelector((state: AppState) =>
    getForumTopicPost(state, postId),
  );
  const topic = useSelector((state: AppState) =>
    getForumTopic(state, post?.topicId),
  );
  const { forumId: forumIdSlug, topicId: topicIdSlug } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  const postCreator = PostCreator(post);

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
    if (replyValue.text.trim() === '') {
      toast.error(t(translations.emptyPost));
      return;
    }
    const forumPostFormData: ForumTopicPostFormData = {
      text: replyValue.text,
      isAnonymous: replyValue.isAnonymous,
      parentId: postId,
    };
    dispatch(
      createForumTopicPost(forumIdSlug!, topicIdSlug!, forumPostFormData),
    )
      .then((response) => {
        toast.success(t(translations.replySuccess));
        setIsReplying(false);
        setReplyValue({
          text: '',
          isAnonymous: false,
        });
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
            action={
              <ForumTopicPostManagementButtons
                handleEdit={(): void => {
                  setIsEditing((prevState) => !prevState);
                  setEditValue(post.text);
                }}
                handleReply={(): void => {
                  setIsReplying((prevState) => !prevState);
                }}
                post={post}
              />
            }
            avatar={postCreator.avatar}
            className="pb-0"
            subheader={formatLongDateTime(post.createdAt)}
            subheaderTypographyProps={{ variant: 'body1' }}
            title={
              <>
                {postCreator.creatorUrl ? (
                  <a
                    href={postCreator.creatorUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {postCreator.creatorName}
                  </a>
                ) : (
                  postCreator.creatorName
                )}
                {postCreator.visibilityIcon}
              </>
            }
            titleTypographyProps={{ variant: 'body1' }}
          />
          <Divider />
          <CardContent className="py-2">
            {isEditing ? (
              <CKEditorRichText
                disableMargins
                inputId={postId.toString()}
                name={`postEditText_${postId}`}
                onChange={(nextValue): void => setEditValue(nextValue)}
                value={editValue}
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
                  className="cancel-edit-button"
                  color="secondary"
                  id={`post_${postId}`}
                  onClick={(): void => setIsEditing(false)}
                >
                  {t(formTranslations.cancel)}
                </Button>
                <Button
                  className="save-button"
                  color="primary"
                  id={`post_${post.id}`}
                  onClick={handleSaveUpdate}
                >
                  {t(formTranslations.save)}
                </Button>
              </>
            ) : (
              <>
                <VotePostButton handleClick={handleVotePost} post={post} />
                <MarkAnswerButton
                  handleClick={handleMarkAnswer}
                  isAnswer={post.isAnswer}
                  topic={topic}
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
                  autofocus
                  disableMargins
                  inputId={postId.toString()}
                  name={`postReplyText_${postId}`}
                  onChange={(nextValue): void =>
                    setReplyValue((prevState) => ({
                      ...prevState,
                      text: nextValue,
                    }))
                  }
                  placeholder={t(translations.replyTo, {
                    user: postCreator.creatorName,
                  })}
                  value={replyValue.text}
                />
                {post.permissions.isAnonymousEnabled && (
                  <Checkbox
                    label={t(translations.postAnonymously)}
                    onChange={(event): void =>
                      setReplyValue((prevState) => ({
                        ...prevState,
                        isAnonymous: event.target.checked,
                      }))
                    }
                  />
                )}
              </CardContent>
              <CardActions className="pt-0">
                <Button
                  className="cancel-reply-button"
                  color="secondary"
                  id={`post_${postId}`}
                  onClick={(): void => setIsReplying(false)}
                >
                  {t(formTranslations.cancel)}
                </Button>
                <Button
                  className="reply-button"
                  color="primary"
                  id={`post_${post.id}`}
                  onClick={handleReply}
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
