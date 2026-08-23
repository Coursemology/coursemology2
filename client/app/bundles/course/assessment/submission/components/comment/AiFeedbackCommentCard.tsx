import { FC } from 'react';
import { Avatar } from '@mui/material';

import RateableGeneratedCommentCard from 'lib/components/core/RateableGeneratedCommentCard';

// The submission bundle types its posts with PropTypes (see ../../propTypes#postShape); this captures just
// the fields the card reads.
interface AiFeedbackPost {
  id: number;
  text: string;
  canUpdate: boolean;
  createdAt: string;
  creator?: { imageUrl?: string };
  generatedRating?: { rating: number | null } | null;
}

interface Props {
  post: AiFeedbackPost;
  rateComment: (rating: number | null) => Promise<void>;
  acceptComment: (editValue: string) => Promise<void>;
  rejectComment: (editValue: string) => Promise<void>;
  deleteComment: () => Promise<void>;
}

/**
 * Wires the shared rateable card to the submission grading comment endpoints (which reuse CourseAPI.comments).
 * Accept publishes the post. A rated reject persists the edited feedback then deletes (the server snapshots
 * it); a direct delete (no rating) deletes only, skipping that update. The avatar is sized to match the other
 * comment cards on the submission page.
 */
const AiFeedbackCommentCard: FC<Props> = ({
  post,
  rateComment,
  acceptComment,
  rejectComment,
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
    currentRating={post.generatedRating?.rating ?? null}
    onAccept={(editValue): Promise<void> => acceptComment(editValue)}
    onRate={(rating): Promise<void> => rateComment(rating)}
    onReject={(editValue, rating): Promise<void> =>
      rating === null ? deleteComment() : rejectComment(editValue)
    }
    postId={post.id}
    text={post.text}
  />
);

export default AiFeedbackCommentCard;
