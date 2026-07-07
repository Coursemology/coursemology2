import { useFieldArray, useFormContext } from 'react-hook-form';
import { Add } from '@mui/icons-material';
import { Button } from '@mui/material';
import { GradingContextSourceOption } from 'types/course/assessment/question/grading-contexts';

import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

import GradingContextItem from './GradingContextItem';

interface GradingContextManagerProps {
  availableGradingContextTypes: string[];
  contextSourceOptions: GradingContextSourceOption[];
  disabled?: boolean;
}

/**
 * Editor for a question's grading contexts (see Course::Assessment::Question::GradingContext). Contexts are
 * replaced wholesale on save, so removing an item simply drops it from the array. Rendered only under rubric
 * grading, and only when the question type supports at least one context provider.
 */
const GradingContextManager = (
  props: GradingContextManagerProps,
): JSX.Element | null => {
  const { availableGradingContextTypes, contextSourceOptions, disabled } =
    props;
  const { t } = useTranslation();
  const { control } = useFormContext();

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'gradingContexts',
    keyName: '_key',
  });

  if (!availableGradingContextTypes.length) return null;

  const addContext = (): void => {
    append({
      id: `new-context-${new Date().getTime()}`,
      contextType: '',
      sourceId: null,
      identifier: '',
      draft: true,
    });
  };

  return (
    <div className="flex flex-col space-y-4">
      {fields.map((field, index) => (
        <GradingContextItem
          key={(field as { _key: string })._key}
          availableGradingContextTypes={availableGradingContextTypes}
          contextSourceOptions={contextSourceOptions}
          disabled={disabled}
          index={index}
          onDelete={(): void => remove(index)}
        />
      ))}

      <Button
        className="w-fit"
        disabled={disabled}
        onClick={addContext}
        size="small"
        startIcon={<Add />}
        variant="outlined"
      >
        {t(translations.addGradingContext)}
      </Button>
    </div>
  );
};

export default GradingContextManager;
