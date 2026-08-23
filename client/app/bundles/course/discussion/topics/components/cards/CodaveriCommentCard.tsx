import { FC } from 'react';
import { Avatar } from '@mui/material';
import { CommentPostMiniEntity } from 'types/course/comments';

import RateableGeneratedCommentCard from 'lib/components/core/RateableGeneratedCommentCard';
import { useAppDispatch } from 'lib/hooks/store';

import { deletePost, updatePostCodaveri } from '../../operations';

interface Props {
  post: CommentPostMiniEntity;
}

/**
 * Wires the shared rateable card to the Codaveri feedback endpoints. Codaveri bundles the rating into its
 * calls rather than exposing a separate rate endpoint, so #onRate is a no-op: accept finalises via
 * updatePostCodaveri (publishing with the rating), and reject deletes -- carrying the rating for a rated
 * reject from edit mode, or none for a direct delete (which skips the codaveri_feedback rejection callback).
 */
const CodaveriCommentCard: FC<Props> = ({ post }) => {
  const dispatch = useAppDispatch();

  return (
    <RateableGeneratedCommentCard
      avatar={<Avatar className="wh-14" src={post.creator.imageUrl} />}
      canUpdate={post.canUpdate}
      createdAt={post.createdAt}
      currentRating={null}
      onAccept={(editValue, rating): Promise<void> =>
        dispatch(updatePostCodaveri(post, editValue, rating))
      }
      onRate={(): Promise<void> => Promise.resolve()}
      onReject={(_editValue, rating): Promise<void> =>
        dispatch(deletePost(post, rating ?? undefined))
      }
      postId={post.id}
      text={post.text}
    />
  );
};

export default CodaveriCommentCard;
