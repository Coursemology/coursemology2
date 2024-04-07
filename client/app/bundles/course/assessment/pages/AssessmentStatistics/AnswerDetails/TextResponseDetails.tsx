import { Typography } from '@mui/material';
import { QuestionAnswerDetails } from 'types/course/statistics/assessmentStatistics';

import AttachmentDetails from './AttachmentDetails';

const TextResponseDetails = (
  props: QuestionAnswerDetails<'TextResponse'>,
): JSX.Element => {
  const { question, answer } = props;

  return (
    <>
      <Typography
        dangerouslySetInnerHTML={{ __html: answer.fields.answer_text }}
        variant="body2"
      />
      {question.maxAttachments > 0 && (
        <div className="w-full mt-4 mb-4">
          <AttachmentDetails attachments={answer.attachments} />
        </div>
      )}
    </>
  );
};

export default TextResponseDetails;
