import { FC } from 'react';
import { defineMessages } from 'react-intl';
import {
  ThumbDownAlt,
  ThumbDownOffAlt,
  ThumbUpAlt,
  ThumbUpOffAlt,
} from '@mui/icons-material';
import { IconButton, IconButtonProps } from '@mui/material';
import { ForumTopicPostEntity } from 'types/course/forums';

import { useAppDispatch } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import useTranslation from 'lib/hooks/useTranslation';

import { voteTopicPost } from '../../operations';

interface Props extends IconButtonProps {
  post: ForumTopicPostEntity;
}

const translations = defineMessages({
  updateFailure: {
    id: 'course.forum.VotePostButton.updateFailure',
    defaultMessage: 'Failed to update the vote number - {error}',
  },
});

const VotePostButton: FC<Props> = ({ post }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  if (!post) return null;

  const handleVotePost = (voteNum: -1 | 0 | 1): void => {
    dispatch(voteTopicPost(post.postUrl, voteNum)).catch((error) => {
      const errorMessage = error.response?.data?.errors ?? '';
      toast.error(
        t(translations.updateFailure, {
          error: errorMessage,
        }),
      );
    });
  };

  if (!post.hasUserVoted) {
    return (
      <div className="flex items-center">
        <IconButton
          color="success"
          onClick={(): void => handleVotePost(1)}
          title="Upvote"
        >
          <ThumbUpOffAlt />
        </IconButton>
        <div className="vote-tally font-bold">{post.voteTally}</div>
        <IconButton
          color="error"
          onClick={(): void => handleVotePost(-1)}
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
        color="success"
        onClick={(): void => handleVotePost(post.userVoteFlag ? 0 : 1)}
        title="Upvote"
      >
        {post.userVoteFlag ? <ThumbUpAlt /> : <ThumbUpOffAlt />}
      </IconButton>
      <div className="vote-tally font-bold">{post.voteTally}</div>

      <IconButton
        color="error"
        onClick={(): void => handleVotePost(!post.userVoteFlag ? 0 : -1)}
        title="Downvote"
      >
        {post.userVoteFlag ? <ThumbDownOffAlt /> : <ThumbDownAlt />}
      </IconButton>
    </div>
  );
};

export default VotePostButton;
