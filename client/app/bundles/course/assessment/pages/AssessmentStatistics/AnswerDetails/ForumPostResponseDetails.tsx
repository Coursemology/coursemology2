import { defineMessages, FormattedMessage } from 'react-intl';
import { Typography } from '@mui/material';
import { QuestionAnswerDisplayDetails } from 'types/course/statistics/assessmentStatistics';

import PostPack from './ForumPostResponseComponent/PostPack';

const translations = defineMessages({
  submittedInstructions: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPostSelect.submittedInstructions',
    defaultMessage:
      '{numPosts, plural, =0 {No posts were} one {# post was} other {# posts were}} submitted.',
  },
});

const ForumPostResponseDetails = (
  props: QuestionAnswerDisplayDetails<'ForumPostResponse'>,
): JSX.Element => {
  const { answer } = props;
  const postPacks = answer.fields.selected_post_packs;

  return (
    <>
      <Typography className="mb-5 mt-5" color="text.secondary" variant="body2">
        <FormattedMessage
          values={{ numPosts: postPacks.length }}
          {...translations.submittedInstructions}
        />
      </Typography>
      {postPacks.length > 0 &&
        postPacks.map((postPack) => (
          <PostPack
            key={`post-pack-${postPack.forum.id}-${postPack.topic.id}`}
            postPack={postPack}
          />
        ))}
    </>
  );
};

export default ForumPostResponseDetails;
