import { FC, useEffect, useRef } from 'react';
import { Divider, Paper } from '@mui/material';

import ChatInputArea from './ChatInputArea';
import ConversationArea from './ConversationArea';
import Header from './Header';

interface GetHelpChatPageProps {
  onFeedbackClick: (linenum: number) => void;
  answerId: number | null;
  questionId: number;
}

const GetHelpChatPage: FC<GetHelpChatPageProps> = (props) => {
  const { onFeedbackClick, answerId, questionId } = props;

  const scrollableRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollableRef.current) {
      const { clientHeight, scrollHeight } = scrollableRef.current;
      if (clientHeight < scrollHeight) {
        scrollableRef.current.scrollTop = scrollableRef.current.scrollHeight;
      }
    }
  });

  if (!answerId) return null;

  return (
    <Paper className="flex flex-col w-full mb-2" variant="outlined">
      <Header answerId={answerId} />

      <Divider />

      <div ref={scrollableRef} className="flex-1 overflow-auto mt-1">
        <ConversationArea
          answerId={answerId}
          onFeedbackClick={onFeedbackClick}
        />
      </div>

      <ChatInputArea answerId={answerId} questionId={questionId} />
    </Paper>
  );
};

export default GetHelpChatPage;
