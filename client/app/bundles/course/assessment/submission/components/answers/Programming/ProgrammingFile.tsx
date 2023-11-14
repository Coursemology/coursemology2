import { FC } from 'react';
import { ProgrammingContent } from 'types/course/assessment/answer/programming';

import ReadOnlyEditor from '../../../containers/ReadOnlyEditor';
import Editor from '../../Editor';

interface ProgrammingFileProps {
  answerId: number;
  fieldName: string;
  file: ProgrammingContent;
  language: string;
  readOnly: boolean;
  saveAnswer: (data: unknown, answerId: number) => void;
}

const ProgrammingFile: FC<ProgrammingFileProps> = (props) => {
  const { answerId, fieldName, file, language, readOnly, saveAnswer } = props;

  return (
    <div className="space-y-3">
      {readOnly ? (
        <ReadOnlyEditor answerId={answerId} file={file} />
      ) : (
        <Editor
          answerId={answerId}
          fieldName={fieldName}
          file={file}
          language={language}
          saveAnswer={saveAnswer}
        />
      )}
    </div>
  );
};

export default ProgrammingFile;
