import { FC, useLayoutEffect, useRef, useState } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Avatar,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from '@mui/material';
import { PostPack } from 'types/course/assessment/submission/answer/forumPostResponse';

import { formatLongDateTime } from 'lib/moment';

interface Props {
  post: PostPack;
  isExpandable?: boolean;
}

const MAX_POST_HEIGHT = 60;

export const translations = defineMessages({
  showMore: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPost.showMore',
    defaultMessage: 'SHOW MORE',
  },
  showLess: {
    id: 'course.assessment.submission.answers.ForumPostResponse.ForumPost.showLess',
    defaultMessage: 'SHOW LESS',
  },
});

const PostContent: FC<Props> = (props) => {
  const { post, isExpandable } = props;
  const [renderedHeight, setRenderedHeight] = useState(0);

  const contentIsExpandable = isExpandable && renderedHeight > MAX_POST_HEIGHT;
  const [isExpanded, setIsExpanded] = useState(!isExpandable);

  const postRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (postRef.current) {
      setRenderedHeight(postRef.current.clientHeight);
    }
  }, [post]);

  return (
    <div ref={postRef}>
      <Card className="forum-post shadow-none border-0">
        <CardHeader
          avatar={<Avatar src={post.avatar} />}
          subheader={formatLongDateTime(post.updatedAt)}
          title={post.userName}
        />
        <Divider />
        <CardContent>
          <Typography
            className={`overflow-hidden ${!isExpanded && contentIsExpandable ? `h-20` : 'h-auto'}`}
            dangerouslySetInnerHTML={{ __html: post.text }}
            variant="body2"
          />
          {contentIsExpandable && (
            <Button
              className="forum-post-expand-button mt-2"
              color="primary"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <FormattedMessage {...translations.showLess} />
              ) : (
                <FormattedMessage {...translations.showMore} />
              )}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PostContent;
