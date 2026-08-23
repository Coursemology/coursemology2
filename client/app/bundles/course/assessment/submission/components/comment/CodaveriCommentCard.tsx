import { FC } from 'react';
import { Avatar } from '@mui/material';

import RateableGeneratedCommentCard from 'lib/components/core/RateableGeneratedCommentCard';

// The submission bundle types its posts with PropTypes (see ../../propTypes#postShape); this captures just
// the fields the card reads.
interface CodaveriPost {
  id: number;
  text: string;
  canUpdate: boolean;
  createdAt: string;
  creator?: { imageUrl?: string };
  codaveriFeedback: { id: number };
}

interface Props {
  post: CodaveriPost;
  updateComment: (
    postId: number,
    codaveriId: number,
    comment: string,
    rating: number,
    status: string,
  ) => Promise<void>;
  deleteComment: (rating?: number) => Promise<void>;
}

/**
 * Wires the shared rateable card to the submission grading Codaveri endpoints. Codaveri bundles the rating
 * into its own calls rather than exposing a separate rate endpoint, so #onRate is a no-op: accept finalises
 * via updateComment (publishing with the rating), and reject deletes -- carrying the rating for a rated
 * reject from edit mode, or none for a direct delete (which skips the codaveri_feedback rejection callback).
 * The avatar is sized to match the other comment cards on the submission page.
 */
const CodaveriCommentCard: FC<Props> = ({
  post,
  updateComment,
  deleteComment,
}) => (
  <RateableGeneratedCommentCard
    avatar={
      <Avatar
        src={post.creator?.imageUrl}
        style={{ height: '25px', width: '25px' }}
      />
    }
    canUpdate={post.canUpdate}
    createdAt={post.createdAt}
    currentRating={null}
    onAccept={(editValue, rating): Promise<void> =>
      updateComment(
        post.id,
        post.codaveriFeedback.id,
        editValue,
        rating,
        'accepted',
      )
    }
    onRate={(): Promise<void> => Promise.resolve()}
    onReject={(_editValue, rating): Promise<void> =>
      deleteComment(rating ?? undefined)
    }
    postId={post.id}
    text={post.text}
  />
);

export default CodaveriCommentCard;
