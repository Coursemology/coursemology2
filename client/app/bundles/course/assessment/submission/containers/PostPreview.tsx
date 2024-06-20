import { FC } from 'react';
import { ChevronRight } from '@mui/icons-material';
import { Typography } from '@mui/material';
import { Annotation } from 'types/course/assessment/submission/annotations';

import stripHtmlTags from 'lib/helpers/htmlFormatHelpers';
import { useAppSelector } from 'lib/hooks/store';

import { getCommentPostById } from '../selectors/comments';

interface Props {
  annotation: Annotation;
}

const PostPreview: FC<Props> = (props) => {
  const { annotation } = props;
  const postId = annotation.postIds.length > 0 ? annotation.postIds[0] : null;

  const post = useAppSelector((state) => getCommentPostById(state, postId));

  const creator = post?.creator?.name ?? '';
  const text = post?.text ?? '';

  const content = `${creator}: ${stripHtmlTags(text)}`;

  return (
    <div className="flex items-center pl-1 w-full overflow-hidden text-ellipsis whitespace-nowrap">
      <ChevronRight className="mr-2" fontSize="small" />

      <Typography
        dangerouslySetInnerHTML={{
          __html: content,
        }}
        variant="body2"
      />
    </div>
  );
};

export default PostPreview;
