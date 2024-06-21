import { FC, MutableRefObject } from 'react';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';

import ReadOnlyEditor from '../../../containers/ReadOnlyEditor';
import Editor from '../../Editor';

interface ProgrammingFileProps {
  answerId: number;
  fieldName: string;
  file: ProgrammingContent;
  language: string;
  readOnly: boolean;
  editorRef: MutableRefObject<null>;
  onCursorChange: (selection: { cursor: { row: number } }) => void;
  saveAnswerAndUpdateClientVersion: (answerId: number) => void;
}

const ProgrammingFile: FC<ProgrammingFileProps> = (props) => {
  const {
    answerId,
    fieldName,
    file,
    language,
    readOnly,
    editorRef,
    onCursorChange,
    saveAnswerAndUpdateClientVersion,
  } = props;

  return (
    <div className="space-y-3">
      {readOnly ? (
        <ReadOnlyEditor answerId={answerId} file={file} />
      ) : (
        <Editor
          editorRef={editorRef}
          fieldName={fieldName}
          file={file}
          language={language}
          onChangeCallback={() => saveAnswerAndUpdateClientVersion(answerId)}
          onCursorChange={onCursorChange}
        />
      )}
    </div>
  );
};

export default ProgrammingFile;
