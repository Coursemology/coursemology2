import { FC } from 'react';
import { IconButton, IconButtonProps } from '@mui/material';
import { ForumTopicPostEntity } from 'types/course/forums';
import {
  ThumbDownOffAlt,
  ThumbUpOffAlt,
  ThumbUpAlt,
  ThumbDownAlt,
} from '@mui/icons-material';

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
          onClick={(): void => handleClick(1)}
          color="info"
          title="Upvote"
        >
          <ThumbUpOffAlt />
        </IconButton>
        <div className="vote-tally font-bold">{post.voteTally}</div>
        <IconButton
          onClick={(): void => handleClick(-1)}
          color="info"
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
        onClick={(): void => handleClick(0)}
        color="info"
        title="Upvote"
      >
        {post.userVoteFlag ? <ThumbUpAlt /> : <ThumbUpOffAlt />}
      </IconButton>
      <div className="vote-tally font-bold">{post.voteTally}</div>

      <IconButton
        onClick={(): void => handleClick(0)}
        color="info"
        title="Downvote"
      >
        {post.userVoteFlag ? <ThumbDownOffAlt /> : <ThumbDownAlt />}
      </IconButton>
    </div>
  );
};

export default VotePostButton;
