import { FC, useState } from 'react';
import { useSelector } from 'react-redux';
import { Element } from 'react-scroll';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material';
import { AppState } from 'types/store';

import CKEditorRichText from 'lib/components/core/fields/CKEditorRichText';
import { formatLongDateTime } from 'lib/moment';

import { getForumTopic, getForumTopicPost } from '../../selectors';
import ForumTopicPostEditActionButtons from '../buttons/ForumTopicPostEditActionButtons';
import ForumTopicPostManagementButtons from '../buttons/ForumTopicPostManagementButtons';
import MarkAnswerButton from '../buttons/MarkAnswerButton';
import VotePostButton from '../buttons/VotePostButton';
import PostCreatorObject from '../misc/PostCreatorObject';

import ReplyCard from './ReplyCard';

interface Props {
  postId: number;
  level: number;
}

const PostCard: FC<Props> = (props) => {
  const { postId, level } = props;
  const [isEditing, setIsEditing] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [replyValue, setReplyValue] = useState({
    text: '',
    isAnonymous: false,
  });

  const post = useSelector((state: AppState) =>
    getForumTopicPost(state, postId),
  );
  const topic = useSelector((state: AppState) =>
    getForumTopic(state, post?.topicId),
  );

  const postCreatorObject = PostCreatorObject({
    creator: post?.creator,
    isAnonymous: post?.isAnonymous,
    canViewAnonymous: post?.permissions.canViewAnonymous,
  });

  if (!post || !topic) return null;

  return (
    <Element name={`postElement_${post.id}`}>
      <div
        className={`post_${post.id}`}
        style={{ marginLeft: 0 + Math.min(3, level - 1) * 25 }}
      >
        <Card
          className={`space-y-4 border-2 border-solid ${
            post.isUnread ? 'bg-red-100' : ''
          } ${post.isAnswer ? 'border-green-600' : 'border-white'} `}
        >
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
                isEditing={isEditing}
                post={post}
              />
            }
            avatar={postCreatorObject.avatar}
            className="pb-0"
            subheader={formatLongDateTime(post.createdAt)}
            subheaderTypographyProps={{ variant: 'body1' }}
            title={
              <>
                {postCreatorObject.userUrl ? (
                  <a
                    href={postCreatorObject.userUrl}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {postCreatorObject.name}
                  </a>
                ) : (
                  postCreatorObject.name
                )}
                {postCreatorObject.visibilityIcon}
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
              <ForumTopicPostEditActionButtons
                editValue={editValue}
                post={post}
                setIsEditing={setIsEditing}
              />
            ) : (
              <>
                <VotePostButton post={post} />
                <MarkAnswerButton
                  isAnswer={post.isAnswer}
                  post={post}
                  topic={topic}
                />
              </>
            )}
          </CardActions>
        </Card>
        {isReplying && (
          <ReplyCard
            isAnonymousEnabled={post.permissions.isAnonymousEnabled}
            isReplying={isReplying}
            postId={post.id}
            repliesTo={postCreatorObject.name}
            replyValue={replyValue}
            setIsReplying={setIsReplying}
            setReplyValue={setReplyValue}
          />
        )}
      </div>
    </Element>
  );
};

export default PostCard;
