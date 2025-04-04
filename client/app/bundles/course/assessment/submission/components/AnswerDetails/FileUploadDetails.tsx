import { QuestionType } from 'types/course/assessment/question';

import { AnswerDetailsProps } from '../../types';

import AttachmentDetails from './AttachmentDetails';

const FileUploadDetails = (
  props: AnswerDetailsProps<QuestionType.FileUpload>,
): JSX.Element => {
  const { answer } = props;

  return (
    <div className="w-full mt-4 mb-4">
      <AttachmentDetails attachments={answer.attachments} />
    </div>
  );
};

export default FileUploadDetails;
