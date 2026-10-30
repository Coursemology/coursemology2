import { FC, MutableRefObject } from 'react';
import { LanguageMode } from 'types/course/assessment/question/programming';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';

import ReadOnlyEditor from '../../../containers/ReadOnlyEditor';
import Editor from '../../Editor';

interface ProgrammingFileProps {
  answerId: number;
  fieldName: string;
  file: ProgrammingContent;
  language: LanguageMode;
  readOnly: boolean;
  editorRef: MutableRefObject<null>;
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
    saveAnswerAndUpdateClientVersion,
  } = props;

  // The space below an editable file; the editor itself has none, so it can line up with a file
  // tree beside it in file mode.
  return (
    <div className={readOnly ? 'space-y-3' : 'mb-3 space-y-3'}>
      {readOnly ? (
        <ReadOnlyEditor answerId={answerId} file={file} />
      ) : (
        <Editor
          editorRef={editorRef}
          fieldName={fieldName}
          language={language}
          onChangeCallback={() => saveAnswerAndUpdateClientVersion(answerId)}
        />
      )}
    </div>
  );
};

export default ProgrammingFile;
