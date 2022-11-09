import { FC } from 'react';
import {
  ThumbDownAlt,
  ThumbDownOffAlt,
  ThumbUpAlt,
  ThumbUpOffAlt,
} from '@mui/icons-material';
import { IconButton, IconButtonProps } from '@mui/material';
import { ForumTopicPostEntity } from 'types/course/forums';

interface Props extends IconButtonProps {
  post: ForumTopicPostEntity;
  handleClick: (voteNumber: -1 | 0 | 1) => void;
}

const VotePostButton: FC<Props> = ({ post, handleClick }) => {
  if (!post) return null;

  if (!post.hasUserVoted) {
    return (
      <div className="flex items-center">
        <IconButton
          color="info"
          onClick={(): void => handleClick(1)}
          title="Upvote"
        >
          <ThumbUpOffAlt />
        </IconButton>
        <div className="vote-tally font-bold">{post.voteTally}</div>
        <IconButton
          color="info"
          onClick={(): void => handleClick(-1)}
          title="Downvote"
        >
          <ThumbDownOffAlt />
        </IconButton>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      <IconButton
        color="info"
        onClick={(): void => handleClick(0)}
        title="Upvote"
      >
        {post.userVoteFlag ? <ThumbUpAlt /> : <ThumbUpOffAlt />}
      </IconButton>
      <div className="vote-tally font-bold">{post.voteTally}</div>

      <IconButton
        color="info"
        onClick={(): void => handleClick(0)}
        title="Downvote"
      >
        {post.userVoteFlag ? <ThumbDownOffAlt /> : <ThumbDownAlt />}
      </IconButton>
    </div>
  );
};

export default VotePostButton;
