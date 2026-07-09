import { Radio } from '@mui/material';

// Reuse the assessment editor's own field labels (same wording + locale entries) instead of
// minting marketplace-local duplicates. `choices` lives in course/assessment/translations.
import translations from 'course/assessment/translations';
import Checkbox from 'lib/components/core/buttons/Checkbox';
import Section from 'lib/components/core/layouts/Section';
import UserHTMLText from 'lib/components/core/UserHTMLText';
import useTranslation from 'lib/hooks/useTranslation';

import { RendererProps } from './types';

const MultipleResponse = ({ question }: RendererProps): JSX.Element => {
  const { t } = useTranslation();
  const detail = question.detail as Extract<
    typeof question.detail,
    { gradingScheme: string }
  >;
  const isMcq = detail.gradingScheme === 'any_correct';
  return (
    <div data-testid="renderer-MultipleResponse">
      <Section title={t(translations.choices)}>
        <div className="space-y-4">
          {detail.options.map((choice) => (
            <div key={choice.id}>
              <Checkbox
                checked={choice.correct}
                className="text-neutral-500"
                component={isMcq ? Radio : undefined}
                readOnly
                userHTML={choice.option}
              />
              {choice.explanation && (
                <UserHTMLText
                  className="ml-8 text-neutral-500"
                  html={choice.explanation}
                />
              )}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
};

export default MultipleResponse;
