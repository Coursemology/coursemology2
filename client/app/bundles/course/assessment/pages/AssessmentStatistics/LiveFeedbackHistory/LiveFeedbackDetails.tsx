import { FC, useRef, useState } from 'react';
import ReactAce from 'react-ace';
import { Box, Card, CardContent, Drawer, Typography } from '@mui/material';
import { LiveFeedbackCodeAndComments } from 'types/course/assessment/submission/liveFeedback';

import EditorField from 'lib/components/core/fields/EditorField';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../translations';

interface Props {
  file: LiveFeedbackCodeAndComments;
}

const LiveFeedbackDetails: FC<Props> = (props) => {
  const { t } = useTranslation();
  const { file } = props;

  const startingLineNum = Math.min(
    ...file.comments.map((comment) => comment.lineNumber),
  );

  const [selectedLine, setSelectedLine] = useState<number>(startingLineNum);
  const editorRef = useRef<ReactAce | null>(null);

  const handleCursorChange = (selection): void => {
    const currentLine = selection.getCursor().row + 1; // Ace editor uses 0-index, so add 1
    setSelectedLine(currentLine);
  };

  const handleCommentClick = (lineNumber: number): void => {
    setSelectedLine(lineNumber);
    if (editorRef.current) {
      editorRef.current.editor.focus();
      editorRef.current.editor.gotoLine(lineNumber, 0, true);
    }
  };

  return (
    <div className="relative" id={`file-${file.id}`}>
      <Box marginRight="315px">
        <EditorField
          ref={editorRef}
          cursorStart={startingLineNum - 1}
          disabled
          focus
          // This height matches the prompt height exactly so there is no awkward scroll bar
          // and the prompt does not expand weirdly when description is opened
          height="43.6rem"
          language={file.editorMode}
          onCursorChange={handleCursorChange}
          value={file.content}
        />
      </Box>
      <Drawer
        anchor="right"
        open
        PaperProps={{
          className: 'absolute w-[31.5rem] border-0 bg-transparent',
        }}
        variant="persistent"
      >
        <div className="p-2">
          {file.comments.map((comment) => (
            <Card
              key={`file-${file.id}-comment-${comment.lineNumber}`}
              className={`mb-1 border border-solid border-gray-400 rounded-lg shadow-none cursor-pointer ${
                selectedLine === comment.lineNumber ? 'bg-yellow-100' : ''
              }`}
              onClick={() => {
                handleCommentClick(comment.lineNumber);
              }}
            >
              <Typography
                className="ml-1"
                fontWeight="bold"
                variant="subtitle1"
              >
                {t(translations.lineHeader, {
                  lineNumber: comment.lineNumber,
                })}
              </Typography>
              <CardContent className="px-1 pt-0 last:pb-1">
                <Typography variant="body2">{comment.comment}</Typography>
              </CardContent>
            </Card>
          ))}
        </div>
      </Drawer>
    </div>
  );
};

export default LiveFeedbackDetails;
