import { FC } from 'react';
import { Control, Controller } from 'react-hook-form';
import { DisbursementFormData } from 'types/course/disbursement';
import FormTextField from 'lib/components/form/fields/DebouncedTextField';

interface Props {
  control: Control<DisbursementFormData>;
  index: number;
  fieldId: string;
  className?: string;
}

const PointTextField: FC<Props> = (props: Props) => {
  const { control, index, fieldId, className } = props;
  return (
    <Controller
      name={`pointList.${index}.points`}
      control={control}
      render={({ field, fieldState }): JSX.Element => (
        <FormTextField
          field={field}
          fieldState={fieldState}
          enableDebouncing
          // @ts-ignore: component is still written in JS
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          onWheel={(event): void => event.currentTarget.blur()}
          type="number"
          variant="standard"
          key={fieldId}
          margins={false}
          className={className}
        />
      )}
    />
  );
};

export default PointTextField;
