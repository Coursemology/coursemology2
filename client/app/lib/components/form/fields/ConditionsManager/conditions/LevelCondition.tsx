import { Controller, useForm } from 'react-hook-form';

import { LevelConditionData } from 'types/course/conditions';
import FormTextField from 'lib/components/form/fields/TextField';
import useTranslation from 'lib/hooks/useTranslation';
import { AnyConditionProps } from './AnyCondition';
import ConditionDialog from './ConditionDialog';
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
    <ConditionDialog
      open={props.open}
      onClose={props.onClose}
      title={t(translations.specifyLevel)}
      onPrimaryAction={handleSubmit(updateLevel)}
      primaryAction={
        isNewCondition
          ? t(translations.createCondition)
          : t(translations.updateCondition)
      }
      primaryActionDisabled={!isNewCondition && !formState.isDirty}
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
    </ConditionDialog>
  );
};

export default LevelCondition;
