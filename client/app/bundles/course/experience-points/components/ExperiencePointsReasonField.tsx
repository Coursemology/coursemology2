import { Dispatch, FC, SetStateAction, useState } from 'react';
import equal from 'fast-deep-equal';
import {
  ExperiencePointsRecordMiniEntity,
  ExperiencePointsRowData,
} from 'types/course/experiencePointsRecords';

import TextField from 'lib/components/core/fields/TextField';
import Link from 'lib/components/core/Link';

interface Props {
  defaultReason: string;
  record: ExperiencePointsRecordMiniEntity;
  rowData: ExperiencePointsRowData;
  disabled: boolean;
  setIsDirty: Dispatch<SetStateAction<boolean>>;
  setRowData: Dispatch<SetStateAction<ExperiencePointsRowData>>;
}

const ExperiencePointsReasonField: FC<Props> = (props) => {
  const { record, rowData, disabled, setIsDirty, defaultReason, setRowData } =
    props;
  const [errorReasonText, setErrorReasonText] = useState('');

  const onUpdateReason = (value: string): void => {
    const newData: ExperiencePointsRowData = { ...rowData, reason: value };
    setIsDirty(value.trim().length > 0 && !equal(value, defaultReason));
    setRowData(newData);
  };

  if (!record.reason.isManuallyAwarded) {
    return (
      <Link opensInNewTab to={record.reason.link}>
        {rowData.reason}
      </Link>
    );
  }
  if (record.permissions.canUpdate) {
    return (
      <TextField
        key={`reason-${record.id}`}
        disabled={disabled}
        error={errorReasonText !== ''}
        fullWidth
        helperText={errorReasonText}
        id={`reason-${record.id}`}
        onChange={(e): void => {
          if (e.target.value.trim().length === 0) {
            setErrorReasonText('must contain at least 1 non-space character');
          } else {
            setErrorReasonText('');
          }
          onUpdateReason(e.target.value);
        }}
        value={rowData.reason}
        variant="standard"
      />
    );
  }
  return rowData.reason;
};

export default ExperiencePointsReasonField;
