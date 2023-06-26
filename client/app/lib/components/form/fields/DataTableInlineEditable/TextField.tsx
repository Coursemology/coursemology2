import { FC, memo, useState } from 'react';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import Edit from '@mui/icons-material/Edit';
import { LoadingButton } from '@mui/lab';
import { Box, IconButton, TextField } from '@mui/material';
import equal from 'fast-deep-equal';

import Link from 'lib/components/core/Link';

interface Props {
  value: string;
  updateValue: (value: string) => void;
  disabled?: boolean;
  label?: JSX.Element;
  renderIf?: boolean;
  className?: string;
  variant: 'standard' | 'filled' | 'outlined';
  link?: string;
  onUpdate?: (newValue: string) => Promise<void>;
  alwaysEditable?: boolean;
}

const styles = {
  textFieldStyle: {
    margin: '0px 10px 0px 0px',
    width: '100%',
  },
  displayFieldStyle: {
    ':not(:hover)': {
      '& button': {
        opacity: 0,
      },
    },
    ':hover': {
      '& button': {
        opacity: 1,
      },
    },
  },
  buttonStyle: { padding: '4px 4px', minWidth: '0px', color: 'inherit' },
};

const InlineEditTextField: FC<Props> = (props): JSX.Element | null => {
  const {
    updateValue,
    value,
    disabled,
    label,
    renderIf = true,
    className,
    link,
    onUpdate,
    alwaysEditable = false,
    ...custom
  } = props;
  const [controlledVal, setControlledVal] = useState(value);
  const [errorText, setHelperText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  if (!renderIf) {
    return null;
  }

  const handleChange = (event): void => {
    setControlledVal(event.target.value.trimStart());
  };

  const handleSave = (): void => {
    setIsSaving(true);
    if (controlledVal.trim() === '') {
      setHelperText('Cannot be empty.');
      setIsSaving(false);
      return;
    }
    if (controlledVal.trim() === value) {
      setIsEditing(false);
      setIsSaving(false);
    } else if (onUpdate) {
      onUpdate(controlledVal.trim())
        .then(() => {
          setIsEditing(false);
          setIsSaving(false);
        })
        .catch((error) => {
          setHelperText(error.response.data.errors);
        })
        .finally(() => setIsSaving(false));
    }
  };

  const handleBlur = (): void => {
    setControlledVal(controlledVal.trim());
    if (alwaysEditable) {
      updateValue(controlledVal.trim());
    }
  };

  const handleCancel = (): void => {
    setControlledVal(value);
    setHelperText('');
    setIsEditing(false);
  };

  const renderDisplayField = (
    <Box className={className} sx={styles.displayFieldStyle}>
      <>
        {link ? <Link href={link}>{controlledVal}</Link> : controlledVal}

        <IconButton
          className="inline-edit-button"
          disabled={disabled}
          onClick={(): void => setIsEditing(true)}
          sx={styles.buttonStyle}
        >
          <Edit />
        </IconButton>
      </>
    </Box>
  );

  const renderEditingField = (
    <Box display="flex" flexDirection="row">
      <TextField
        className={className}
        disabled={disabled ?? isSaving}
        error={Boolean(errorText)}
        helperText={errorText}
        label={label}
        onBlur={handleBlur}
        onChange={handleChange}
        value={controlledVal}
        {...custom}
        style={styles.textFieldStyle}
      />
      {!alwaysEditable && (
        <>
          <LoadingButton
            className="confirm-btn"
            loading={isSaving}
            onClick={handleSave}
            sx={styles.buttonStyle}
          >
            <Check />
          </LoadingButton>
          <IconButton
            className="cancel-btn"
            disabled={isSaving}
            onClick={handleCancel}
            sx={styles.buttonStyle}
          >
            <Clear />
          </IconButton>
        </>
      )}
    </Box>
  );

  return isEditing || alwaysEditable ? renderEditingField : renderDisplayField;
};

export default memo(InlineEditTextField, equal);
