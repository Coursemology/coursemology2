import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import { PostPack } from 'types/course/assessment/submission/answer/forumPostResponse';

import Labels from 'course/assessment/submission/components/answers/ForumPostResponse/Labels';

import PostContent from './PostContent';

const translations = defineMessages({
  postMadeInResponseTo: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ParentPost.postMadeInResponseTo',
    defaultMessage: 'Post made in response to:',
  },
});

interface Props {
  post: PostPack;
}

const ParentPostPack: FC<Props> = (props) => {
  const { post } = props;

  return (
    <div className="m-4">
      <Typography className="mb-5" color="text.secondary" variant="body2">
        <FormattedMessage {...translations.postMadeInResponseTo} />
      </Typography>
      <Labels post={post} />
      <PostContent isExpandable post={post} />
    </div>
  );
};

export default ParentPostPack;
