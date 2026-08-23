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
 * Wires the shared rateable card to the discussion (rubric feedback) endpoints. Accept publishes the post; a
 * rated reject persists the edited feedback (snapshotted server-side) then deletes it, while a direct delete
 * (no rating) simply deletes -- there is no edit to snapshot.
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
      onReject={async (editValue, rating): Promise<void> => {
        // A rated reject persists the edited feedback so the before-destroy hook can snapshot it; a direct
        // delete (no rating) has nothing to snapshot, so skip the update and just delete.
        if (rating !== null) {
          await dispatch(updatePost(post, editValue));
        }
        await dispatch(deletePost(post));
      }}
      postId={post.id}
      text={post.text}
    />
  );
};

export default AiFeedbackCommentCard;
