import { useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Radio, Typography } from '@mui/material';
import { McqMrqListData } from 'types/course/assessment/multiple-responses';
import { QuestionData } from 'types/course/assessment/questions';

import Checkbox from 'lib/components/core/buttons/Checkbox';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import ConvertMcqMrqPrompt from './prompts/ConvertMcqMrqPrompt';

interface McqWidgetProps {
  for: QuestionData;
  onChange: (question: QuestionData) => void;
}

const isMcq = (question: QuestionData): question is McqMrqListData =>
  (question as McqMrqListData)?.options !== undefined;

const McqWidget = (props: McqWidgetProps): JSX.Element | null => {
  const { for: question } = props;
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const [converting, setConverting] = useState(false);

  if (!isMcq(question)) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between space-x-4">
        {question.options.length ? (
          <Button
            endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
            onClick={(): void => setExpanded((wasExpanded) => !wasExpanded)}
            size="small"
            variant="outlined"
          >
            {expanded
              ? t(translations.hideOptions)
              : t(translations.showOptions)}
          </Button>
        ) : (
          <Typography className="italic text-neutral-500" variant="body2">
            {t(translations.noOptions)}
          </Typography>
        )}

        <Button onClick={(): void => setConverting(true)} size="small" variant="outlined">
          {question.mcqMrqType === 'mcq'
            ? t(translations.changeToMrqFull)
            : t(translations.changeToMcqFull)}
        </Button>
      </div>

      <Collapse in={expanded}>
        {question.options.map((choice) => (
          <Checkbox
            key={choice.id}
            checked={choice.correct}
            className="text-neutral-500"
            component={question.mcqMrqType === 'mcq' ? Radio : undefined}
            dangerouslySetInnerHTML={{ __html: choice.option }}
            labelClassName="items-start"
            readOnly
            variant="body2"
          />
        ))}
      </Collapse>

      <ConvertMcqMrqPrompt
        for={question}
        onClose={(): void => setConverting(false)}
        onConvertComplete={props.onChange}
        open={converting}
      />
    </section>
  );
};

export default McqWidget;
