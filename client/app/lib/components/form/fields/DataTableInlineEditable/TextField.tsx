import { FC, useState, memo } from 'react';
import { Box, IconButton, TextField } from '@mui/material';
import Edit from '@mui/icons-material/Edit';
import Check from '@mui/icons-material/Check';
import Clear from '@mui/icons-material/Clear';
import equal from 'fast-deep-equal';
import { LoadingButton } from '@mui/lab';

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
  buttonStyle: { padding: '0px 8px', minWidth: '0px', color: 'inherit' },
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
  const [helperText, setHelperText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  if (!renderIf) {
    return null;
  }

  const handleChange = (event): void => {
    setControlledVal(event.target.value);
  };

  const handleSave = (): void => {
    setIsSaving(true);
    if (controlledVal === '') {
      setHelperText('Cannot be empty.');
      return;
    }
    if (controlledVal === value) {
      setIsEditing(false);
    } else if (onUpdate) {
      onUpdate(controlledVal)
        .then(() => {
          setIsEditing(false);
          setIsSaving(false);
        })
        .catch((error) => {
          setHelperText(error.response.data.errors);
        });
    }
  };

  const handleBlur = (): void => {
    if (alwaysEditable) {
      updateValue(controlledVal);
    }
  };

  const handleCancel = (): void => {
    setControlledVal(value);
    setIsEditing(false);
  };

  const renderDisplayField = (
    <Box sx={styles.displayFieldStyle} className={className}>
      <>
        {link ? <a href={link}>{controlledVal}</a> : <>{controlledVal}</>}
        {!disabled && (
          <IconButton
            onClick={(): void => setIsEditing(true)}
            sx={styles.buttonStyle}
            className="inline-edit-button"
          >
            <Edit />
          </IconButton>
        )}
      </>
    </Box>
  );

  const renderEditingField = (
    <Box display="flex" flexDirection="row">
      <TextField
        value={controlledVal}
        onChange={handleChange}
        className={className}
        disabled={disabled || isSaving}
        label={label}
        onBlur={handleBlur}
        helperText={helperText}
        {...custom}
        style={styles.textFieldStyle}
      />
      {!alwaysEditable && (
        <>
          <LoadingButton
            loading={isSaving}
            onClick={handleSave}
            sx={styles.buttonStyle}
          >
            <Check />
          </LoadingButton>
          <IconButton
            onClick={handleCancel}
            sx={styles.buttonStyle}
            disabled={isSaving}
          >
            <Clear />
          </IconButton>
        </>
      )}
    </Box>
  );

  return isEditing || alwaysEditable ? renderEditingField : renderDisplayField;
};

export default memo(InlineEditTextField, (prevProps, nextProps) => {
  return (
    equal(prevProps.value, nextProps.value) &&
    equal(prevProps.link, nextProps.link)
  );
});
