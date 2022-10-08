import { FC } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import FormTextField from 'lib/components/form/fields/TextField';

interface Props {
  courseUserId: number;
}
const PointField: FC<Props> = (props: Props) => {
  const { courseUserId } = props;
  const { control } = useFormContext();

  return (
    <Controller
      name={`courseUser_${courseUserId}`}
      control={control}
      render={({ field, fieldState }): JSX.Element => (
        <FormTextField
          field={field}
          fieldState={fieldState}
          // @ts-ignore: component is still written in JS
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          onWheel={(event): void => event.currentTarget.blur()}
          type="number"
          variant="standard"
          disableMargins
          className="points_awarded"
        />
      )}
    />
  );
};

export default PointField;
