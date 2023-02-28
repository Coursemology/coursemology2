import { useState } from 'react';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Button, Collapse, Radio, Typography } from '@mui/material';
import { McqMrqListData } from 'types/course/assessment/question/multiple-responses';
import { QuestionData } from 'types/course/assessment/questions';

import Checkbox from 'lib/components/core/buttons/Checkbox';
import useTranslation from 'lib/hooks/useTranslation';

import ConvertMcqMrqButton from '../../components/ConvertMcqMrqButton';
import translations from '../../translations';

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

        <ConvertMcqMrqButton
          for={{
            ...question,
            title: question.title ? question.title : question.defaultTitle,
          }}
          onConvertComplete={props.onChange}
        />
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
    </section>
  );
};

export default McqWidget;
