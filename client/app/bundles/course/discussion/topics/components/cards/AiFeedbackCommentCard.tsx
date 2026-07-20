import { FC } from 'react';
import { Avatar } from '@mui/material';
import { CommentPostMiniEntity } from 'types/course/comments';

import RateableGeneratedCommentCard from 'lib/components/core/RateableGeneratedCommentCard';
import { useAppDispatch } from 'lib/hooks/store';

import {
  deletePost,
  publishPost,
  updateAiFeedbackRating,
  updatePost,
} from '../../operations';

interface Props {
  post: CommentPostMiniEntity;
}

/**
 * Wires the shared rateable card to the discussion (rubric feedback) endpoints. Accept publishes the post;
 * reject persists the edit then deletes it -- the server snapshots the edited feedback in both cases.
 */
const AiFeedbackCommentCard: FC<Props> = ({ post }) => {
  const dispatch = useAppDispatch();

  return (
    <RateableGeneratedCommentCard
      avatar={<Avatar className="wh-14" src={post.creator.imageUrl} />}
      canUpdate={post.canUpdate}
      createdAt={post.createdAt}
      currentRating={post.generatedRating?.rating ?? null}
      onAccept={(editValue): Promise<void> =>
        dispatch(publishPost(post, editValue))
      }
      onRate={(rating): Promise<void> =>
        dispatch(updateAiFeedbackRating(post, rating))
      }
      onReject={async (editValue): Promise<void> => {
        await dispatch(updatePost(post, editValue));
        await dispatch(deletePost(post));
      }}
      postId={post.id}
      text={post.text}
    />
  );
};

export default AiFeedbackCommentCard;
