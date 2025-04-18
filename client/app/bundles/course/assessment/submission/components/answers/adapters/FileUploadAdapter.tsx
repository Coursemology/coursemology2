import FileUploadAnswer from '../FileUpload';
import type { FileUploadAnswerProps } from '../types';

const FileUploadAdapter = (props: FileUploadAnswerProps): JSX.Element => {
  const { question, answerId, readOnly, handleUploadTextResponseFiles } = props;
  return (
    <FileUploadAnswer
      key={`question_${question.id}`}
      answerId={answerId!}
      handleUploadTextResponseFiles={handleUploadTextResponseFiles}
      question={question}
      readOnly={readOnly}
    />
  );
};

export default FileUploadAdapter;
