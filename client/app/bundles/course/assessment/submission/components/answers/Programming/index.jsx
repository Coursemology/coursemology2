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
import TestCaseView from '../../../containers/TestCaseView';
import { questionShape } from '../../../propTypes';
import { parseLanguages } from '../../../utils';

import ProgrammingFile from './ProgrammingFile';
import { Drawer, IconButton, Tooltip, Card, CardContent, CardHeader, CardActions, Typography } from '@mui/material';

import { grey, orange, yellow } from '@mui/material/colors';
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
    opacity: 0.6
  },
  cardDismissed: {
    opacity: 0.6
  }
};


const ProgrammingFiles = ({
  readOnly,
  answerId,
  language,
  saveAnswerAndUpdateClientVersion,
  onSelectionChange,
  editorRef,
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
    return (
      <ProgrammingFile
        key={field.id}
        answerId={answerId}
        fieldName={`${answerId}.files_attributes.${index}.content`}
        file={file}
        language={language}
        readOnly={readOnly}
        editorRef={editorRef}
        onSelectionChange={onSelectionChange}
        saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
      />
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
  // TODO move all the code to ProgrammingFiles, so we can add filename filtering logic
  const annotations = Object.values(feedbackFiles).flat();
  const containerRef = useRef();
  const editorRef = useRef(null);
  const [selectedLine, setSelectedLine] = useState(null);
  const [open, setOpen] = useState(true);

  const dispatch = useAppDispatch();

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
        <>
          <div id="editor-container" ref={containerRef} style={{ position: "relative" }}>
            <ProgrammingFiles 
              key={question.id}
              answerId={answerId}
              language={parseLanguages(question.language)}
              readOnly={readOnly}
              saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
              onSelectionChange={(selection, event) => {
                const selectedRow = selection?.cursor?.row;
                if (selectedRow || selectedRow === 0) {
                  setSelectedLine(selectedRow + 1);
                }
              }}
              editorRef={editorRef}
            />
            <Drawer
              variant="persistent"
              anchor="right"
              open={annotations?.filter(ann => ann.state === 'pending')?.length > 0}
              PaperProps={{ style: { position: 'absolute' } }}
              ModalProps={{
                container: document.getElementById('editor-container'),
                style: { position: 'absolute' }
              }}
            >
            <div>
              {annotations.map(ann => {
                let cardStyle = styles.card;
                if (ann.state === 'resolved') {
                  cardStyle = { ...styles.card, ...styles.cardResolved };
                } else if (ann.state === 'dismissed') {
                  cardStyle = { ...styles.card, ...styles.cardDismissed };
                } else if (selectedLine === ann.linenum) {
                  cardStyle = { ...styles.card, ...styles.cardSelected };
                }

                return <Card sx={cardStyle}>
                <CardContent sx={{ p: 1 }} onClick={() => {
                  editorRef.current?.editor?.selection?.setAnchor(ann.linenum - 1, 0);
                  editorRef.current?.editor?.selection?.moveCursorTo(ann.linenum - 1, 0);
                  editorRef.current?.editor?.focus();
                }}>
                  <Typography variant="body2">
                    {ann.feedback}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 0 }}>
                  <IconButton
                    className="p-1 ml-1"
                    onClick={() => {
                      dispatch({ type: actionTypes.LIVE_FEEDBACK_ITEM_MARK_RESOLVED, payload: {
                        questionId: question.id,
                        path: 'main.py',
                        lineId: ann.id,
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
                        questionId: question.id,
                        path: 'main.py',
                        lineId: ann.id,
                      }});
                    }}
                    size="small"
                  >
                    <ThumbDown />
                  </IconButton>
                  {(ann.state === 'resolved') && <Typography variant="caption">
                    You resolved this comment.
                  </Typography>}
                  {(ann.state === 'dismissed') && <Typography variant="caption">
                    You dismissed this comment.
                  </Typography>}
                </CardActions>
              </Card>
            })}
            </div>
            </Drawer>
          </div>
        </>
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
