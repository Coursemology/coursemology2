import { FC, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { ChevronRight, ExpandMore } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { SelectedPostPack } from 'types/course/assessment/submission/answer/forumPostResponse';

import Labels from 'course/assessment/submission/components/answers/ForumPostResponse/Labels';
import Link from 'lib/components/core/Link';
import { getForumTopicURL, getForumURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';

import ParentPostPack from './ParentPostPack';
import PostContent from './PostContent';

const translations = defineMessages({
  topicDeleted: {
    id: 'course.assessment.submission.answers.ForumPostResponse.SelectedPostCard.topicDeleted',
    defaultMessage: 'Post made under a topic that was subsequently deleted.',
  },
  postMadeUnder: {
    id: 'course.assessment.submission.answers.ForumPostResponse.SelectedPostCard.postMadeUnder',
    defaultMessage: 'Post made under {topicUrl} in {forumUrl}',
  },
});

interface Props {
  postPack: SelectedPostPack;
}

const MAX_NAME_LENGTH = 30;

const generateLink = (url: string, name: string): JSX.Element => {
  const renderedName =
    name.length > MAX_NAME_LENGTH
      ? `${name.slice(0, MAX_NAME_LENGTH)}...`
      : name;
  return (
    <Link opensInNewTab to={url}>
      {renderedName}
    </Link>
  );
};

const PostPack: FC<Props> = (props) => {
  const { postPack } = props;
  const courseId = getCourseId();
  const [isExpanded, setIsExpanded] = useState(false);

  const ForumPostLabel = (): JSX.Element => {
    const { forum, topic } = postPack;
    return (
      <div className="flex items-center">
        {isExpanded ? (
          <ExpandMore fontSize="small" />
        ) : (
          <ChevronRight fontSize="small" />
        )}
        <Typography variant="body2">
          {topic.isDeleted ? (
            <FormattedMessage {...translations.topicDeleted} />
          ) : (
            <FormattedMessage
              values={{
                topicUrl: generateLink(
                  getForumTopicURL(courseId, forum.id, topic.id),
                  topic.title,
                ),
                forumUrl: generateLink(
                  getForumURL(courseId, forum.id),
                  forum.name,
                ),
              }}
              {...translations.postMadeUnder}
            />
          )}
        </Typography>
      </div>
    );
  };

  return (
    <div
      key={`forum-post-pack-${postPack.forum.id}-${postPack.topic.id}`}
      className="mb-12 shadow-md rounded-md overflow-hidden"
    >
      <div
        className="p-4 bg-green-50 cursor-pointer flex justify-between items-center"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ForumPostLabel />
      </div>
      {isExpanded && (
        <>
          <Labels post={postPack.corePost} />
          <PostContent post={postPack.corePost} />
          {postPack.parentPost && <ParentPostPack post={postPack.parentPost} />}
        </>
      )}
    </div>
  );
};

export default PostPack;
