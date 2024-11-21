import { FC, ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { MessageFormatElement } from 'react-intl';
import { BeatLoader } from 'react-spinners';
import { Close, Send } from '@mui/icons-material';
import {
  Button,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import moment from 'moment';

import {
  generateLiveFeedback,
  generateUserRequest,
} from 'course/assessment/submission/actions/answers';
import actionTypes from 'course/assessment/submission/constants';
import { getAssessment } from 'course/assessment/submission/selectors/assessments';
import { getFeedbackByQuestionId } from 'course/assessment/submission/selectors/liveFeedbacks';
import { getQuestions } from 'course/assessment/submission/selectors/questions';
import translations from 'course/assessment/submission/translations';
import { LiveFeedbackMessage } from 'course/assessment/submission/types';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';
import { SHORT_DATE_TIME_FORMAT } from 'lib/moment';

interface GetHelpPageProps {
  stepIndex: number;
  editorRef: RefObject<EditorRef>;
}
interface EditorRef {
  editor: {
    gotoLine: (line: number, column: number) => void;
    selection: {
      setAnchor: (row: number, column: number) => void;
      moveCursorTo: (row: number, column: number) => void;
    };
    focus: () => void;
  };
}

const Header: FC<{ questionId: number }> = ({ questionId }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const handleClose = (): void => {
    dispatch({
      type: actionTypes.LIVE_FEEDBACK_OPEN_POPUP,
      payload: {
        questionId,
        isDialogOpen: false,
      },
    });
  };

  return (
    <div className="flex items-start justify-between py-4">
      <Typography className="pl-6" variant="h6">
        {t(translations.getHelpHeader)}
      </Typography>
      <IconButton onClick={handleClose} size="small">
        <Close />
      </IconButton>
    </div>
  );
};

const Bubble: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rounded-lg p-2 max-w-[70%] bg-gray-300">{children}</div>
);

const MessageList: FC<{
  messages: LiveFeedbackMessage[];
  editorRef: RefObject<EditorRef>;
  focusedMessageIndex: number | undefined;
  loading: boolean;
}> = ({ messages, editorRef, focusedMessageIndex, loading }) => {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (listRef.current && focusedMessageIndex !== undefined) {
      const messageElement = listRef.current.children[
        focusedMessageIndex
      ] as HTMLElement;
      if (messageElement) {
        listRef.current.scrollTop = messageElement.offsetTop;
      }
    }
  }, [messages, focusedMessageIndex]);

  const focusEditorOnFeedbackLine = (linenum: number | null): void => {
    if (typeof linenum !== 'number' || linenum < 0) return;
    editorRef.current?.editor?.gotoLine(linenum, 0);
    editorRef.current?.editor?.selection?.setAnchor(linenum - 1, 0);
    editorRef.current?.editor?.selection?.moveCursorTo(linenum - 1, 0);
    editorRef.current?.editor?.focus();
  };

  return (
    <List ref={listRef} className="flex-grow overflow-auto pb-16">
      {messages.map((message, index) => (
        <ListItem
          key={index}
          className={`py-0 ${
            message.sender === 'Codaveri' ? 'justify-start' : 'justify-end'
          }`}
          onClick={() => focusEditorOnFeedbackLine(message.linenum)}
        >
          <ListItemText
            className={`rounded-lg p-2 max-w-[70%] flex-none ${
              message.sender === 'Codaveri' ? 'bg-gray-300' : 'bg-blue-100'
            }`}
            primary={
              message.isBold ? (
                <Typography className="text-[1.3rem]" fontWeight="bold">
                  {message.text}
                </Typography>
              ) : (
                <Typography className="text-[1.3rem]">
                  {message.text}
                </Typography>
              )
            }
            secondary={
              message.timestamp
                ? moment(message.timestamp).format(SHORT_DATE_TIME_FORMAT)
                : ''
            }
          />
        </ListItem>
      ))}
      {loading && (
        <ListItem className="justify-start py-0">
          <Bubble>
            <BeatLoader color="grey" size={8} />
          </Bubble>
        </ListItem>
      )}
    </List>
  );
};

const SuggestionButtons: FC<{
  loading: boolean;
  suggestions: string[];
  handleSendMessage: (message: string) => void;
}> = ({ loading, suggestions, handleSendMessage }) => (
  <div className="absolute top-[-4rem] flex justify-center mb-0 w-full flex-row h-[52%] overflow-x-auto">
    {suggestions.map((suggestion, index) => (
      <Button
        key={index}
        className="bg-white mx-1 text-[1.3rem] min-w-[160px]"
        disabled={loading}
        onClick={() => handleSendMessage(suggestion)}
        variant="outlined"
      >
        {suggestion}
      </Button>
    ))}
  </div>
);

const InputField: FC<{
  loading: boolean;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: (message: string) => void;
}> = ({ loading, input, setInput, handleKeyDown, handleSendMessage }) => {
  const { t } = useTranslation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setInput(e.target.value);
  };

  return (
    <div className="flex items-center w-full">
      <TextField
        className="p-6 pt-0 pb-[1%]"
        disabled={loading}
        fullWidth
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={t(translations.typeYourMessage)}
        size="medium"
        value={input}
        variant="outlined"
      />
      <IconButton
        className="p-4 pb-[3.3%]"
        disabled={loading || input.trim() === ''}
        onClick={() => handleSendMessage(input)}
      >
        {loading ? <CircularProgress size={24} /> : <Send />}
      </IconButton>
    </div>
  );
};

const InputArea: FC<{
  loading: boolean;
  suggestions: {
    id: string;
    defaultMessage: string | MessageFormatElement[] | undefined;
  }[];
  questionId: number;
  answerId: number | undefined;
  submissionId: string | null;
  questionIndex: number;
}> = ({
  loading,
  suggestions,
  questionId,
  answerId,
  submissionId,
  questionIndex,
}) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const [input, setInput] = useState<string>('');
  const translatedSuggestions = suggestions.map((suggestion) => t(suggestion));

  const handleSendMessage = async (message: string): Promise<void> => {
    if (message.trim()) {
      const successMessage = t(translations.liveFeedbackSuccess, {
        questionIndex,
      });
      const noFeedbackMessage = t(translations.liveFeedbackNoneGenerated, {
        questionIndex,
      });
      setInput('');
      dispatch(generateUserRequest(questionId, answerId, message));
      dispatch(
        generateLiveFeedback({
          submissionId,
          answerId,
          questionId,
          successMessage,
          noFeedbackMessage,
        }),
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleSendMessage(input);
    }
  };

  return (
    <div className="relative flex flex-col items-center">
      <SuggestionButtons
        handleSendMessage={handleSendMessage}
        loading={loading}
        suggestions={translatedSuggestions}
      />
      <InputField
        handleKeyDown={handleKeyDown}
        handleSendMessage={handleSendMessage}
        input={input}
        loading={loading}
        setInput={setInput}
      />
    </div>
  );
};

const GetHelpPage: FC<GetHelpPageProps> = ({ stepIndex, editorRef }) => {
  const [messages, setMessages] = useState<LiveFeedbackMessage[]>([]);
  const assessment = useAppSelector(getAssessment);
  const questions = useAppSelector(getQuestions);
  const submissionId = getSubmissionId();
  const { questionIds } = assessment;
  const questionId = questionIds[stepIndex];
  const question = questions[questionId];
  const { answerId } = question;
  const liveFeedback = useAppSelector((state) =>
    getFeedbackByQuestionId(state, questionId),
  );
  const isRequestingLiveFeedback = !!liveFeedback?.isRequestingLiveFeedback;
  const conversation = liveFeedback?.conversation ?? [];
  const suggestedReplies = liveFeedback?.suggestedReplies ?? [];
  const focusedMessageIndex = liveFeedback?.focusedMessageIndex;

  useEffect(() => {
    setMessages(conversation);
  }, [conversation]);

  const questionIndex = questionIds.findIndex((id) => id === questionId) + 1;

  return (
    <div className="absolute top-[-3.3%] right-0 z-[1000] w-2/5 h-[113%] flex flex-col p-0">
      <Paper className="absolute right-0 z-[1000] w-full h-full flex flex-col p-0">
        <Header questionId={questionId} />
        <Divider className="m-0" />
        <MessageList
          editorRef={editorRef}
          focusedMessageIndex={focusedMessageIndex}
          loading={isRequestingLiveFeedback}
          messages={messages}
        />
        <InputArea
          answerId={answerId}
          loading={isRequestingLiveFeedback}
          questionId={questionId}
          questionIndex={questionIndex}
          submissionId={submissionId}
          suggestions={suggestedReplies}
        />
      </Paper>
    </div>
  );
};

export default GetHelpPage;
