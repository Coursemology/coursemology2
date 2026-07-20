import { FC } from 'react';
import { Avatar } from '@mui/material';
import { ForumTopicPostEntity } from 'types/course/forums';

import RateableGeneratedCommentCard from 'lib/components/core/RateableGeneratedCommentCard';
import { useAppDispatch } from 'lib/hooks/store';

import {
  deleteForumTopicPost,
  publishPost,
  updateForumTopicPost,
  updateRagWiseRating,
} from '../../operations';

interface Props {
  post: ForumTopicPostEntity;
  canManage: boolean;
}

/**
 * Wires the shared rateable card to the forum (RagWise answer) endpoints. Accept persists the edit then
 * publishes the post; reject persists the edit then deletes it -- the server snapshots the edited content in
 * both cases.
 */
const RagWiseCommentCard: FC<Props> = ({ post, canManage }) => {
  const dispatch = useAppDispatch();

  return (
    <RateableGeneratedCommentCard
      avatar={<Avatar className="h-20 w-20" src={post.creator?.imageUrl} />}
      canUpdate={canManage}
      createdAt={post.createdAt}
      currentRating={post.generatedRating?.rating ?? null}
      onAccept={(editValue): Promise<void> =>
        dispatch(publishPost(post.id, post.postUrl, editValue))
      }
      onRate={(rating): Promise<void> =>
        dispatch(updateRagWiseRating(post.postUrl, rating))
      }
      onReject={async (editValue): Promise<void> => {
        await dispatch(updateForumTopicPost(post.postUrl, editValue));
        await dispatch(
          deleteForumTopicPost(post.postUrl, post.id, post.topicId),
        );
      }}
      postId={post.id}
      text={post.text}
    />
  );
};

export default RagWiseCommentCard;
