import { QuestionAnswerDisplayDetails } from 'types/course/statistics/assessmentStatistics';

import AttachmentDetails from './AttachmentDetails';

const FileUploadDetails = (
  props: QuestionAnswerDisplayDetails<'FileUpload'>,
): JSX.Element => {
  const { answer } = props;

  return (
    <div className="w-full mt-4 mb-4">
      <AttachmentDetails attachments={answer.attachments} />
    </div>
  );
};

export default FileUploadDetails;
