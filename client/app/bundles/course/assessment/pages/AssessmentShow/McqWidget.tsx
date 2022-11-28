import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Radio } from '@mui/material';
import { McqData, QuestionData } from 'types/course/assessment/assessments';

import Checkbox from 'lib/components/core/buttons/Checkbox';
import useToggle from 'lib/hooks/useToggle';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import ConvertMcqMrqPrompt from './prompts/ConvertMcqMrqPrompt';

interface McqWidgetProps {
  for: QuestionData;
  onChange: (question: QuestionData) => void;
}

const isMcq = (question: QuestionData): question is McqData =>
  (question as McqData)?.options !== undefined;

const McqWidget = (props: McqWidgetProps): JSX.Element | null => {
  const { for: question } = props;
  const { t } = useTranslation();
  const [expanded, toggleExpanded] = useToggle();
  const [converting, toggleConverting] = useToggle();

  if (!isMcq(question)) return null;

  return (
    <section className="space-y-4">
      <div className="flex justify-between space-x-4">
        <Button
          endIcon={expanded ? <ExpandLess /> : <ExpandMore />}
          onClick={toggleExpanded}
          size="small"
          variant="outlined"
        >
          {expanded ? t(translations.hideOptions) : t(translations.showOptions)}
        </Button>

        <Button onClick={toggleConverting} size="small" variant="outlined">
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
        onClose={toggleConverting}
        onConvertComplete={props.onChange}
        open={converting}
      />
    </section>
  );
};

export default McqWidget;
