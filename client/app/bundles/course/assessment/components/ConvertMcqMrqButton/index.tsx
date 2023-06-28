import { useState } from 'react';
import { Button } from '@mui/material';
import { McqMrqListData } from 'types/course/assessment/question/multiple-responses';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import ConvertMcqMrqPrompt, { ConvertMcqMrqData } from './ConvertMcqMrqPrompt';

interface ConvertMcqMrqButtonProps {
  for: ConvertMcqMrqData;
  onConvertComplete: (data: McqMrqListData) => void;
  disabled?: boolean;
  new?: boolean;
}

const ConvertMcqMrqButton = (props: ConvertMcqMrqButtonProps): JSX.Element => {
  const { for: question } = props;

  const [converting, setConverting] = useState(false);

  const { t } = useTranslation();

  return (
    <>
      <Button
        disabled={props.disabled}
        href={props.new ? question.convertUrl : undefined}
        onClick={(): void => setConverting(true)}
        size="small"
        variant="outlined"
      >
        {question.mcqMrqType === 'mcq'
          ? t(translations.changeToMrq)
          : t(translations.changeToMcq)}
      </Button>

      {!props.new && (
        <ConvertMcqMrqPrompt
          for={question}
          onClose={(): void => setConverting(false)}
          onConvertComplete={props.onConvertComplete}
          open={converting}
        />
      )}
    </>
  );
};

export default ConvertMcqMrqButton;
