import React, { FC } from 'react';
import { Button } from '@mui/material';

import { TranslatableMessage } from 'course/assessment/submission/types';
import useTranslation from 'lib/hooks/useTranslation';

interface SuggestionButtonsProps {
  loading: boolean;
  suggestions: TranslatableMessage[];
  handleSendMessage: (message: string) => void;
}

const SuggestionButtons: FC<SuggestionButtonsProps> = ({
  loading,
  suggestions,
  handleSendMessage,
}) => {
  const { t } = useTranslation();
  const translatedSuggestions = suggestions.map((suggestion) => ({
    id: suggestion.id,
    message: t(suggestion),
  }));

  return (
    <div className="scrollbar-hidden absolute bottom-full flex p-3 gap-3 justify-around w-full overflow-x-auto">
      {translatedSuggestions.map((suggestion) => (
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

export default SuggestionButtons;
