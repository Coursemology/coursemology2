import { Dispatch, FC, SetStateAction, useState } from 'react';
import equal from 'fast-deep-equal';
import {
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';

import NumberTextField from 'lib/components/core/fields/NumberTextField';

interface Props {
  defaultPoint: number;
  record: ExperiencePointsRecordMiniEntity;
  disabled: boolean;
  rowData: ExperiencePointsRowData;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
  setRowData: Dispatch<SetStateAction<ExperiencePointsRowData>>;
}

const ExperiencePointsNumberField: FC<Props> = (props) => {
  const { defaultPoint, record, disabled, rowData, setIsDirty, setRowData } =
    props;
  const [errorHelperText, setErrorHelperText] = useState('');

  const onUpdatePoints = (value: string): void => {
    const newData: ExperiencePointsRowData = {
      ...rowData,
      pointsAwarded:
        Number.isNaN(Number(value)) || value === '' ? value : Number(value),
    };

    setIsDirty(
      !equal(newData.pointsAwarded, defaultPoint) &&
        rowData.reason.trim().length > 0,
    );
    setRowData(newData);
  };

  return record.permissions.canUpdate ? (
    <NumberTextField
      key={`points-${record.id}`}
      disabled={disabled}
      error={errorHelperText !== ''}
      helperText={errorHelperText}
      id={`points-${record.id}`}
      onChange={(e): void => {
        // at this point, any non-integer value will be rounded down
        const inputValue = Number(e.target.value);
        if (Number.isNaN(inputValue)) {
          // in case the input is '-' or '.'
          setErrorHelperText('must be a number');
        } else if (!record.reason.isManuallyAwarded) {
          if (inputValue < 0) {
            setErrorHelperText('must not be negative');
          } else if (inputValue > record.reason.maxExp!) {
            setErrorHelperText(`must be at most ${record.reason.maxExp!}`);
          } else {
            setErrorHelperText('');
          }
        } else {
          setErrorHelperText('');
        }
        onUpdatePoints(e.target.value);
      }}
      placeholder={record.pointsAwarded?.toString() ?? 0}
      value={rowData.pointsAwarded}
      variant="standard"
    />
  ) : (
    record.pointsAwarded
  );
};

export default ExperiencePointsNumberField;
