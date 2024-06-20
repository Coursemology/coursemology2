import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import PropTypes from 'prop-types';
import { FC, useEffect, useState, useRef } from 'react';
import { Check, Close, QuestionMark, ChevronRight, ThumbUp, ThumbDown } from '@mui/icons-material';

import { getIsSavingAnswer } from 'course/assessment/submission/selectors/answerFlags';
import { useAppSelector } from 'lib/hooks/store';
import { useAppDispatch } from 'lib/hooks/store';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import CodaveriFeedbackStatus from '../../../containers/CodaveriFeedbackStatus';
import ProgrammingImportEditor from '../../../containers/ProgrammingImport/ProgrammingImportEditor';

import { questionShape } from '../../../propTypes';
import { parseLanguages } from '../../../utils';

import ProgrammingFile from './ProgrammingFile';
import { 
  Box, Drawer, IconButton, Tooltip, Card, CardContent, CardHeader, CardActions, Typography } from '@mui/material';

import { grey, orange, yellow, red, green } from '@mui/material/colors';
import actionTypes from '../../../constants';

const styles = {
  card: {
    marginBottom: 1,
    borderStyle: 'solid',
    borderWidth: 0.2,
    borderColor: grey[400],
    borderRadius: 2,
    minWidth: 300,
    maxWidth: 300,
  },
  header: {
    display: 'flex',
    backgroundColor: orange[100],
    borderRadius: 2,
    padding: 1,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },
  cardSelected: {
    backgroundColor: yellow[100],
  },
  headerSelected: {
    backgroundColor: orange['A100']
  },
  cardResolved: {
    opacity: 0.6,
    backgroundColor: green['100']
  },
  cardDismissed: {
    opacity: 0.6,
    backgroundColor: red['100']
  }
};


const ProgrammingFiles = ({
  readOnly,
  questionId,
  answerId,
  language,
  feedbackFiles,
  saveAnswerAndUpdateClientVersion,
}) => {
  const { control } = useFormContext();

  const { fields } = useFieldArray({
    control,
    name: `${answerId}.files_attributes`,
  });

  const currentField = useWatch({
    control,
    name: `${answerId}.files_attributes`,
  });

  const containerRef = useRef();
  const editorRef = useRef(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const dispatch = useAppDispatch();

  const onEditorSelectionChange = (selection) => {
    const selectedRow = selection?.cursor?.row;
    if (selectedRow || selectedRow === 0) {
      setSelectedLine(selectedRow + 1);
    }
  };

  const editorKeyboardHandler = {
    handleKeyboard: (data, hash, keyString) => {
      const selectedRow = editorRef.current?.editor?.selection?.cursor?.row;
      const lastRow = (editorRef.current?.editor?.session?.getLength() ?? 1) - 1;
      if (selectedRow || selectedRow === 0) {
        if (keyString === 'up') {
          setSelectedLine(Math.max(selectedRow - 1, 0) + 1);
        } else if (keyString === 'down') {
          setSelectedLine(Math.min(selectedRow + 1, lastRow) + 1);
        }
      }
    }
  };

  useEffect(() => {
    editorRef.current?.editor?.keyBinding?.addKeyboardHandler(editorKeyboardHandler);
    return () => {
      editorRef.current?.editor?.keyBinding?.removeKeyboardHandler(editorKeyboardHandler);
    };
  });

  const renderFeedbackCard = (feedbackItem) => {
    let cardStyle = styles.card;
    if (feedbackItem.state === 'resolved') {
      cardStyle = { ...styles.card, ...styles.cardResolved };
    } else if (feedbackItem.state === 'dismissed') {
      cardStyle = { ...styles.card, ...styles.cardDismissed };
    } else if (selectedLine === feedbackItem.linenum) {
      cardStyle = { ...styles.card, ...styles.cardSelected };
    }

    return <Card sx={cardStyle}>
      <CardContent sx={{ p: 1 }} onClick={() => {
        editorRef.current?.editor?.gotoLine(feedbackItem.linenum, 0);
        editorRef.current?.editor?.selection?.setAnchor(feedbackItem.linenum - 1, 0);
        editorRef.current?.editor?.selection?.moveCursorTo(feedbackItem.linenum - 1, 0);
        editorRef.current?.editor?.focus();
      }}>
        <Typography variant="body2">
          {feedbackItem.feedback}
        </Typography>
      </CardContent>
      <CardActions sx={{ p: 0, display: 'flex' }}>
        <Typography variant="subtitle1" fontWeight="bold" sx={{ ml: 1 }}>
          L{feedbackItem.linenum}
        </Typography>
        {(feedbackItem.state === 'resolved') && <Typography variant="caption">
          Item resolved.
        </Typography>}
        {(feedbackItem.state === 'dismissed') && <Typography variant="caption">
          Item dismissed.
        </Typography>}
        <Box sx={{ flex: "1", width: "100%" }}/>
        <IconButton
          className="p-1 ml-1"
          onClick={() => {
            dispatch({ type: actionTypes.LIVE_FEEDBACK_ITEM_MARK_RESOLVED, payload: {
              questionId,
              path: 'main.py',
              lineId: feedbackItem.id,
            }});
          }}
          size="small"
        >
          <ThumbUp />
        </IconButton>
        <IconButton
          className="p-1 ml-1"
          onClick={() => {
            dispatch({ type: actionTypes.LIVE_FEEDBACK_ITEM_MARK_DISMISSED, payload: {
              questionId,
              path: 'main.py',
              lineId: feedbackItem.id,
            }});
          }}
          size="small"
        >
          <ThumbDown />
        </IconButton>
        <IconButton
          className="p-1 ml-1"
          onClick={() => {
            dispatch({ type: actionTypes.LIVE_FEEDBACK_ITEM_DELETE, payload: {
              questionId,
              path: 'main.py',
              lineId: feedbackItem.id,
            }});
          }}
          size="small"
        >
          <Close />
        </IconButton>
      </CardActions>
    </Card>
  }

  const controlledProgrammingFields = fields.map((field, index) => ({
    ...field,
    ...currentField[index],
  }));

  return controlledProgrammingFields.map((field, index) => {
    const file = {
      id: field.id,
      filename: field.filename,
      content: field.content,
      highlightedContent: field.highlightedContent,
    };

    let annotations = feedbackFiles[field.filename] ?? [];
    // TODO: remove special casing around Codaveri name coercion issue
    if (index === 0 && !controlledProgrammingFields.some(field => field.filename === "main.py")) {
      annotations = feedbackFiles['main.py'] ?? [];
    }
    return (
      <div id="editor-container" ref={containerRef} style={{ position: "relative" }}>
        <ProgrammingFile
          key={field.id}
          answerId={answerId}
          fieldName={`${answerId}.files_attributes.${index}.content`}
          file={file}
          language={language}
          readOnly={readOnly}
          editorRef={editorRef}
          onSelectionChange={onEditorSelectionChange}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
        <Drawer
          variant="persistent"
          anchor="right"
          open={annotations?.filter(feedbackItem => feedbackItem.state === 'pending')?.length > 0}
          PaperProps={{ style: { position: 'absolute' } }}
          ModalProps={{
            container: document.getElementById('editor-container'),
            style: { position: 'absolute' }
          }}
        >
          <div>
            {annotations.map(renderFeedbackCard)}
          </div>
        </Drawer>
      </div>
    );
  });
};

const Programming = (props) => {
  const { question, readOnly, answerId, saveAnswerAndUpdateClientVersion } =
    props;
  const fileSubmission = question.fileSubmission;
  const isSavingAnswer = useAppSelector((state) =>
    getIsSavingAnswer(state, answerId),
  );

  const feedbackFiles = useAppSelector((state) => 
    state.assessments.submission.liveFeedback?.[question.id]?.feedbackFiles ?? []);

  return (
    <div className="mt-5">
      {fileSubmission ? (
        <ProgrammingImportEditor
          key={question.id}
          answerId={answerId}
          isSavingAnswer={isSavingAnswer}
          question={question}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      ) : (
        <ProgrammingFiles 
          key={question.id}
          questionId={question.id}
          answerId={answerId}
          language={parseLanguages(question.language)}
          feedbackFiles={feedbackFiles}
          readOnly={readOnly}
          saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
        />
      )}
      {/* <TestCaseView questionId={question.id} /> */}
      <CodaveriFeedbackStatus answerId={answerId} questionId={question.id} />
    </div>
  );
};

Programming.propTypes = {
  question: questionShape.isRequired,
  readOnly: PropTypes.bool.isRequired,
  answerId: PropTypes.number.isRequired,
  saveAnswerAndUpdateClientVersion: PropTypes.func.isRequired,
};

export default Programming;
