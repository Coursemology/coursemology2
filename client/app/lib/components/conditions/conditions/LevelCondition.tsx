import { Controller, useForm } from 'react-hook-form';

import { LevelConditionData } from 'types/course/conditions';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import Prompt from 'lib/components/Prompt';
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
      open={props.open}
      onClose={props.onClose}
      title={t(translations.specifyLevel)}
      onClickPrimary={handleSubmit(updateLevel)}
      primaryLabel={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      primaryDisabled={!isNewCondition && !formState.isDirty}
    >
      <Controller
        name="minimumLevel"
        control={control}
        render={({ field, fieldState }): JSX.Element => (
          <FormTextField
            field={field}
            fieldState={fieldState}
            variant="filled"
            type="number"
            fullWidth
            label={t(translations.level)}
          />
        )}
      />
    </Prompt>
  );
};

export default LevelCondition;
