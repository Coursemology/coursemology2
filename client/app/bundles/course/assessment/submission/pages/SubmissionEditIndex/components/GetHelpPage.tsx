import { FC, ReactNode, RefObject, useEffect, useRef, useState } from 'react';
import { MessageFormatElement } from 'react-intl';
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
import LoadingEllipsis from 'lib/components/core/LoadingEllipsis';
import { getSubmissionId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

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

const Message: FC<{
  message: LiveFeedbackMessage;
  onClick: (linenum: number | null) => void;
}> = ({ message, onClick }) => {
  const [isOpen, setIsOpen] = useState(true);

  const handleClick = (): void => {
    onClick(message.linenum);
  };

  const renderMessageText = (): JSX.Element => (
    <>
      {message.sender === 'Codaveri' && message.linenum != null && (
        <Typography
          className="text-[1.3rem] cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          Line: {message.linenum}
        </Typography>
      )}
      {message.text.map((line, index) => (
        <Typography key={index} className="text-[1.3rem]">
          {line}
        </Typography>
      ))}
    </>
  );

  return (
    <ListItem
      className={`py-0 ${message.sender === 'Codaveri' ? 'justify-start' : 'justify-end'}`}
      onClick={handleClick}
    >
      <ListItemText
        className={`rounded-lg p-2 max-w-[70%] flex-none ${message.bgColor}`}
        primary={renderMessageText()}
        secondary={message.timestamp ? message.timestamp : ''}
      />
    </ListItem>
  );
};

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

  const handleClick = (linenum: number | null): void => {
    if (typeof linenum !== 'number' || linenum < 0) return;
    editorRef.current?.editor?.gotoLine(linenum, 0);
    editorRef.current?.editor?.selection?.setAnchor(linenum - 1, 0);
    editorRef.current?.editor?.selection?.moveCursorTo(linenum - 1, 0);
    editorRef.current?.editor?.focus();
  };

  return (
    <List ref={listRef} className="flex-grow overflow-auto pb-16">
      {messages.map((message, index) => (
        <Message
          key={index}
          message={message}
          onClick={() => handleClick(message.linenum)}
        />
      ))}
      {loading && (
        <ListItem className="justify-start py-0">
          <Bubble>
            <LoadingEllipsis />
          </Bubble>
        </ListItem>
      )}
    </List>
  );
};

const SuggestionButtons: FC<{
  loading: boolean;
  suggestions: {
    id: string;
    defaultMessage: string | MessageFormatElement[] | undefined;
  }[];
  handleSendMessage: (message: string) => void;
}> = ({ loading, suggestions, handleSendMessage }) => {
  const { t } = useTranslation();
  const translatedSuggestions = suggestions.map((suggestion) => ({
    id: suggestion.id,
    message: t(suggestion),
  }));

  return (
    <div className="scrollbar-hidden absolute bottom-full flex p-3 gap-3 justify-around w-full overflow-x-auto">
      {translatedSuggestions.map((suggestion, index) => (
        <Button
          key={suggestion.id}
          className="bg-white whitespace-nowrap shrink-0"
          disabled={loading}
          onClick={() => handleSendMessage(suggestion.message)}
          variant="outlined"
        >
          {suggestion.message}
        </Button>
      ))}
    </div>
  );
};

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
        suggestions={suggestions}
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
          messages={conversation}
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
