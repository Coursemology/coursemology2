import { useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Close, ThumbDown, ThumbUp } from '@mui/icons-material';
import {
  Box,
  Card,
  CardActions,
  CardContent,
  Drawer,
  IconButton,
  Typography,
} from '@mui/material';
import { green, grey, orange, red, yellow } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { getIsSavingAnswer } from 'course/assessment/submission/selectors/answerFlags';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-github';

import actionTypes from '../../../constants';
import CodaveriFeedbackStatus from '../../../containers/CodaveriFeedbackStatus';
import ProgrammingImportEditor from '../../../containers/ProgrammingImport/ProgrammingImportEditor';
import { questionShape } from '../../../propTypes';
import { parseLanguages } from '../../../utils';

import ProgrammingFile from './ProgrammingFile';

const styles = {
  card: {
    marginBottom: 1,
    borderStyle: 'solid',
    borderWidth: 0.2,
    borderColor: grey[400],
    borderRadius: 2,
    minWidth: '300px',
    maxWidth: '300px',
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
    backgroundColor: orange.A100,
  },
  cardResolved: {
    opacity: 0.6,
    backgroundColor: green['100'],
  },
  cardDismissed: {
    opacity: 0.6,
    backgroundColor: red['100'],
  },
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

  const editorRef = useRef(null);
  const [selectedLine, setSelectedLine] = useState(null);

  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const onEditorCursorChange = (selection) => {
    const selectedRow = selection?.cursor?.row;
    if (selectedRow || selectedRow === 0) {
      setSelectedLine(selectedRow + 1);
    }
  };

  // const editorKeyboardHandler = {
  //   handleKeyboard: (data, hash, keyString) => {
  //     const selectedRow = editorRef.current?.editor?.selection?.cursor?.row;
  //     const lastRow =
  //       (editorRef.current?.editor?.session?.getLength() ?? 1) - 1;
  //     if (selectedRow || selectedRow === 0) {
  //       if (keyString === 'up') {
  //         setSelectedLine(Math.max(selectedRow - 1, 0) + 1);
  //       } else if (keyString === 'down') {
  //         setSelectedLine(Math.min(selectedRow + 1, lastRow) + 1);
  //       }
  //     }
  //   },
  // };

  // useEffect(() => {
  //   editorRef.current?.editor?.keyBinding?.addKeyboardHandler(
  //     editorKeyboardHandler,
  //   );
  //   return () => {
  //     editorRef.current?.editor?.keyBinding?.removeKeyboardHandler(
  //       editorKeyboardHandler,
  //     );
  //   };
  // });

  const renderFeedbackCard = (feedbackItem) => {
    let cardStyle = styles.card;
    if (feedbackItem.state === 'resolved') {
      cardStyle = { ...styles.card, ...styles.cardResolved };
    } else if (feedbackItem.state === 'dismissed') {
      cardStyle = { ...styles.card, ...styles.cardDismissed };
    } else if (selectedLine === feedbackItem.linenum) {
      cardStyle = { ...styles.card, ...styles.cardSelected };
    }

    return (
      <Card sx={cardStyle}>
        <CardContent
          onClick={() => {
            editorRef.current?.editor?.gotoLine(feedbackItem.linenum, 0);
            editorRef.current?.editor?.selection?.setAnchor(
              feedbackItem.linenum - 1,
              0,
            );
            editorRef.current?.editor?.selection?.moveCursorTo(
              feedbackItem.linenum - 1,
              0,
            );
            editorRef.current?.editor?.focus();
          }}
          sx={{ p: 1 }}
        >
          <Typography variant="body2">{feedbackItem.feedback}</Typography>
        </CardContent>
        <CardActions sx={{ p: 0, display: 'flex' }}>
          <Typography fontWeight="bold" sx={{ ml: 1 }} variant="subtitle1">
            L{feedbackItem.linenum}
          </Typography>
          {feedbackItem.state === 'resolved' && (
            <Typography variant="caption">
              {t({
                id: 'course.assessment.submission.answers.Programming.liveFeedbackItemResolved',
                defaultMessage: 'Item resolved.',
              })}
            </Typography>
          )}
          {feedbackItem.state === 'dismissed' && (
            <Typography variant="caption">
              {t({
                id: 'course.assessment.submission.answers.Programming.liveFeedbackItemDismissed',
                defaultMessage: 'Item dismissed.',
              })}
            </Typography>
          )}
          <Box sx={{ flex: '1', width: '100%' }} />
          <IconButton
            className="p-1 ml-1"
            onClick={() => {
              // TODO: expose BE route to Codaveri feedback rating endpoint and call here
              dispatch({
                type: actionTypes.LIVE_FEEDBACK_ITEM_MARK_RESOLVED,
                payload: {
                  questionId,
                  path: 'main.py',
                  lineId: feedbackItem.id,
                },
              });
            }}
            size="small"
          >
            <ThumbUp />
          </IconButton>
          <IconButton
            className="p-1 ml-1"
            onClick={() => {
              dispatch({
                type: actionTypes.LIVE_FEEDBACK_ITEM_MARK_DISMISSED,
                payload: {
                  questionId,
                  path: 'main.py',
                  lineId: feedbackItem.id,
                },
              });
            }}
            size="small"
          >
            <ThumbDown />
          </IconButton>
          <IconButton
            className="p-1 ml-1"
            onClick={() => {
              dispatch({
                type: actionTypes.LIVE_FEEDBACK_ITEM_DELETE,
                payload: {
                  questionId,
                  path: 'main.py',
                  lineId: feedbackItem.id,
                },
              });
            }}
            size="small"
          >
            <Close />
          </IconButton>
        </CardActions>
      </Card>
    );
  };

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
    if (
      index === 0 &&
      !controlledProgrammingFields.some((elem) => elem.filename === 'main.py')
    ) {
      annotations = feedbackFiles['main.py'] ?? [];
    }
    const keyString = `editor-container-${index}`;
    const shouldOpenDrawer = annotations?.some(
      (feedbackItem) => feedbackItem.state === 'pending',
    );

    return (
      <div key={keyString} id={keyString} style={{ position: 'relative' }}>
        <Box marginRight={shouldOpenDrawer ? '315px' : '0px'}>
          <ProgrammingFile
            key={field.id}
            answerId={answerId}
            editorRef={editorRef}
            fieldName={`${answerId}.files_attributes.${index}.content`}
            file={file}
            language={language}
            onCursorChange={onEditorCursorChange}
            readOnly={readOnly}
            saveAnswerAndUpdateClientVersion={saveAnswerAndUpdateClientVersion}
          />
        </Box>
        <Drawer
          anchor="right"
          ModalProps={{
            container: document.getElementById(keyString),
            style: { alignContent: 'start', position: 'absolute' },
          }}
          open={shouldOpenDrawer}
          PaperProps={{ style: { position: 'absolute' } }}
          variant="persistent"
        >
          <div>{annotations.map(renderFeedbackCard)}</div>
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

  const feedbackFiles = useAppSelector(
    (state) =>
      state.assessments.submission.liveFeedback?.feedbackByQuestion?.[
        question.id
      ]?.feedbackFiles ?? [],
  );

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
          answerId={answerId}
          feedbackFiles={feedbackFiles}
          language={parseLanguages(question.language)}
          questionId={question.id}
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
