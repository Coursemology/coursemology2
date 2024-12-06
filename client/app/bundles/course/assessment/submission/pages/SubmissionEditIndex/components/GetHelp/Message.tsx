import React, { FC } from 'react';
import { ListItem, ListItemText, Typography } from '@mui/material';

import {
  LiveFeedbackMessage,
  Sender,
} from 'course/assessment/submission/types';
import useTranslation from 'lib/hooks/useTranslation';

interface MessageProps {
  message: LiveFeedbackMessage;
  onClick: (linenum: number | null) => void;
}

const Message: FC<MessageProps> = ({ message, onClick }) => {
  const handleClick = (): void => {
    onClick(message.linenum);
  };

  const renderMessageText = (): JSX.Element => {
    const { t } = useTranslation();

    return (
      <>
        {message.texts.map((line, index) => (
          <Typography
            key={message.id}
            className="text-[1.3rem] cursor-pointer"
            fontWeight={message.isBold ? 'bold' : 'normal'}
          >
            {typeof line === 'string' ? line : t(line)}
          </Typography>
        ))}
      </>
    );
  };

  return (
    <ListItem
      className={`py-0 ${message.sender === Sender.Codaveri ? 'justify-start' : 'justify-end'}`}
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

export default Message;
