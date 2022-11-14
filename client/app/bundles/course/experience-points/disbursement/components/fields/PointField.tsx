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
      control={control}
      name={`courseUser_${courseUserId}`}
      render={({ field, fieldState }): JSX.Element => (
        <FormTextField
          className="points_awarded"
          disableMargins
          field={field}
          fieldState={fieldState}
          fullWidth
          InputLabelProps={{
            shrink: true,
          }}
          onWheel={(event): void => event.currentTarget.blur()}
          type="number"
          variant="standard"
        />
      )}
    />
  );
};

export default PointField;
