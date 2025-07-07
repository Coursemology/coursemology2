import { ComponentRef, FC, useRef, useState } from 'react';
import { defineMessages } from 'react-intl';
import { Divider, Paper, Typography } from '@mui/material';
import { MessageFile } from 'types/course/assessment/submission/liveFeedback';

import ProgrammingFileDownloadChip from 'course/assessment/submission/components/answers/Programming/ProgrammingFileDownloadChip';
import EditorField from 'lib/components/core/fields/EditorField';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  file: MessageFile;
}

const translations = defineMessages({
  codeHistory: {
    id: 'course.assessment.submission.liveFeedbackHistory.codeHistory',
    defaultMessage: 'Code History',
  },
});

const LiveFeedbackFiles: FC<Props> = (props) => {
  const { file } = props;
  const { t } = useTranslation();

  const editorRef = useRef<ComponentRef<typeof EditorField>>(null);

  const [selectedLine, setSelectedLine] = useState(1);

  const handleCursorChange = (selection): void => {
    const currentLine = selection.getCursor().row + 1; // Ace editor uses 0-index, so add 1
    setSelectedLine(currentLine);
  };

  return (
    <Paper className="flex flex-col w-full flex-1" variant="outlined">
      <div className="flex-none p-1 flex items-center justify-between">
        <Typography className="pl-2" variant="subtitle1">
          {t(translations.codeHistory)}
        </Typography>
        <div className="pr-2">
          <ProgrammingFileDownloadChip file={file} />
        </div>
      </div>

      <Divider />

      <div className="flex-1 overflow-auto">
        <EditorField
          ref={editorRef}
          className="h-full"
          cursorStart={selectedLine}
          disabled
          focus
          language={file.editorMode}
          onCursorChange={handleCursorChange}
          value={file.content}
        />
      </div>
    </Paper>
  );
};

export default LiveFeedbackFiles;
