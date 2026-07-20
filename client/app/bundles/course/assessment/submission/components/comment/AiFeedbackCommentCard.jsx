import { Avatar } from '@mui/material';
import PropTypes from 'prop-types';

import RateableGeneratedCommentCard from 'lib/components/core/RateableGeneratedCommentCard';

import { postShape } from '../../propTypes';

/**
 * Wires the shared rateable card to the submission grading comment endpoints (which reuse CourseAPI.comments).
 * Accept publishes the post; reject persists the edit then deletes it -- the server snapshots the edited
 * feedback in both cases. The avatar is sized to match the other comment cards on the submission page.
 */
const AiFeedbackCommentCard = ({
  post,
  rateComment,
  acceptComment,
  rejectComment,
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
    onAccept={(editValue) => acceptComment(editValue)}
    onRate={(rating) => rateComment(rating)}
    onReject={(editValue) => rejectComment(editValue)}
    postId={post.id}
    text={post.text}
  />
);

AiFeedbackCommentCard.propTypes = {
  post: postShape.isRequired,
  rateComment: PropTypes.func.isRequired,
  acceptComment: PropTypes.func.isRequired,
  rejectComment: PropTypes.func.isRequired,
};

export default AiFeedbackCommentCard;
