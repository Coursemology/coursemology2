import React, { FC, ReactNode, RefObject, useEffect, useRef } from 'react';
import { List, ListItem } from '@mui/material';

import {
  EditorRef,
  LiveFeedbackMessage,
} from 'course/assessment/submission/types';
import LoadingEllipsis from 'lib/components/core/LoadingEllipsis';

import Message from './Message';

interface MessageListProps {
  messages: LiveFeedbackMessage[];
  editorRef: RefObject<EditorRef>;
  focusedMessageIndex: number | undefined;
  loading: boolean;
}

const Bubble: FC<{ children: ReactNode }> = ({ children }) => (
  <div className="rounded-lg p-2 max-w-[70%] bg-gray-300">{children}</div>
);

const MessageList: FC<MessageListProps> = ({
  messages,
  editorRef,
  focusedMessageIndex,
  loading,
}) => {
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
          key={message.id}
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

export default MessageList;
