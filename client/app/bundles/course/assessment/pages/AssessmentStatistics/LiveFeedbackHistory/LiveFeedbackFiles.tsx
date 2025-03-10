import { FC, useRef, useState } from 'react';
import ReactAce from 'react-ace';
import { MessageFile } from 'types/course/assessment/submission/liveFeedback';

import ProgrammingFileDownloadChip from 'course/assessment/submission/components/answers/Programming/ProgrammingFileDownloadChip';
import EditorField from 'lib/components/core/fields/EditorField';

interface Props {
  file: MessageFile;
}

const LiveFeedbackFiles: FC<Props> = (props) => {
  const { file } = props;

  const editorRef = useRef<ReactAce | null>(null);

  const [selectedLine, setSelectedLine] = useState(1);

  const handleCursorChange = (selection): void => {
    const currentLine = selection.getCursor().row + 1; // Ace editor uses 0-index, so add 1
    setSelectedLine(currentLine);
  };

  return (
    <div className="mt-5 flex flex-col space-y-2 gap-3 mb-1 max-h-[100%]">
      <div className="w-fit">
        <ProgrammingFileDownloadChip file={file} />
      </div>

      <EditorField
        ref={editorRef}
        cursorStart={selectedLine}
        disabled
        focus
        language={file.editorMode}
        onCursorChange={handleCursorChange}
        value={file.content}
      />
    </div>
  );
};

export default LiveFeedbackFiles;
