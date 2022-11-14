import { Controller, useForm } from 'react-hook-form';
import { LevelConditionData } from 'types/course/conditions';

import Prompt from 'lib/components/core/dialogs/Prompt';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';

import { AnyConditionProps } from '../AnyCondition';
import translations from '../translations';

const LevelCondition = (
  props: AnyConditionProps<LevelConditionData>,
): JSX.Element => {
  const { control, handleSubmit, setError, formState } = useForm({
    defaultValues: props.condition ?? { minimumLevel: 1 },
  });

  const { t } = useTranslation();

  const updateLevel = (data: LevelConditionData): void => {
    props.onUpdate(data, (errors) =>
      setError('minimumLevel', { message: errors.errors.minimum_level }),
    );
  };

  const isNewCondition = !props.condition;

  return (
    <Prompt
      onClickPrimary={handleSubmit(updateLevel)}
      onClose={props.onClose}
      open={props.open}
      primaryDisabled={!isNewCondition && !formState.isDirty}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      title={t(translations.specifyLevel)}
    >
      <Controller
        control={control}
        name="minimumLevel"
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            fullWidth
            label={t(translations.level)}
            type="number"
            variant="filled"
          />
        )}
      />
    </Prompt>
  );
};

export default LevelCondition;
