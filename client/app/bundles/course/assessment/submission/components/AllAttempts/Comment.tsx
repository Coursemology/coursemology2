import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Avatar, Box, CardHeader, Typography } from '@mui/material';
import { CommentItem } from 'types/course/assessment/submission/submission-question';

import useTranslation from 'lib/hooks/useTranslation';
import { formatLongDateTime } from 'lib/moment';

interface Props {
  comments: CommentItem[];
}

const translations = defineMessages({
  comments: {
    id: 'course.assessment.statistics.comments',
    defaultMessage: 'Comments',
  },
});

const Comment: FC<Props> = (props) => {
  const { comments } = props;
  const { t } = useTranslation();

  return (
    <div className="mt-8">
      <Typography className="mb-5" variant="h6">
        {t(translations.comments)}
      </Typography>

      {comments.map((comment) => (
        <Box
          key={comment.id.toString()}
          className="border-solid border-slate-200"
        >
          <div
            className={
              comment.isDelayed
                ? 'flex items-center justify-between bg-orange-100 rounded-sm'
                : 'flex items-center justify-between bg-gray-100 rounded-sm'
            }
          >
            <CardHeader
              avatar={
                <Avatar
                  className="w-[25px] h-[25px]"
                  src={comment.creator.imageUrl}
                />
              }
              className="p-6"
              subheader={`${formatLongDateTime(comment.createdAt)}${
                comment.isDelayed ? ' (delayed comment)' : ''
              }`}
              subheaderTypographyProps={{ display: 'block' }}
              title={comment.creator.name}
              titleTypographyProps={{ display: 'block', marginright: 20 }}
            />
          </div>
          <div className="break-words p-2">
            <Typography
              dangerouslySetInnerHTML={{ __html: comment.text }}
              variant="body2"
            />
          </div>
        </Box>
      ))}
    </div>
  );
};

export default Comment;
