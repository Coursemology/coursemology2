import React, { FC, useState } from 'react';
import { MessageFormatElement } from 'react-intl';

import {
  generateLiveFeedback,
  generateUserRequest,
} from 'course/assessment/submission/actions/answers';
import translations from 'course/assessment/submission/translations';
import { useAppDispatch } from 'lib/hooks/store';
import useTranslation from 'lib/hooks/useTranslation';

import InputField from './InputField';
import SuggestionButtons from './SuggestionButtons';

interface InputAreaProps {
  loading: boolean;
  suggestions: {
    id: string;
    defaultMessage: string | MessageFormatElement[] | undefined;
  }[];
  questionId: number;
  answerId: number | undefined;
  submissionId: string | null;
  questionIndex: number;
}

const InputArea: FC<InputAreaProps> = ({
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

export default InputArea;
