import React, { FC } from 'react';
import { Send } from '@mui/icons-material';
import { CircularProgress, IconButton, TextField } from '@mui/material';

import translations from 'course/assessment/submission/translations';
import useTranslation from 'lib/hooks/useTranslation';

interface InputFieldProps {
  loading: boolean;
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSendMessage: (message: string) => void;
}

const InputField: FC<InputFieldProps> = ({
  loading,
  input,
  setInput,
  handleKeyDown,
  handleSendMessage,
}) => {
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

export default InputField;
