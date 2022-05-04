import { useRef } from 'react';
import PropTypes from 'prop-types';
import { IconButton } from '@mui/material';
import { grey } from '@mui/material/colors';
import Photo from '@mui/icons-material/Photo';

const styles = {
  imageUploaderDiv: {
    position: 'relative',
  },
  imageUploader: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    opacity: 0,
  },
};

const RenderImageField = (props) => {
  const { field, index, disabled } = props;
  const fieldId = `option-${index}-image-field`;
  const inputRef = useRef(null);
  return (
    <div style={styles.imageUploaderDiv}>
      <label htmlFor={fieldId}>
        <IconButton disabled={disabled} onClick={() => inputRef.click()}>
          <Photo htmlColor={disabled ? undefined : grey[700]} />
        </IconButton>
      </label>
      <input
        id={fieldId}
        type="file"
        style={styles.imageUploader}
        onChange={(event) => {
          const image = event.target.files[0];
          field.onChange(image);
          field.onBlur();
        }}
        ref={inputRef}
        {...{ disabled }}
      />
    </div>
  );
};

RenderImageField.propTypes = {
  disabled: PropTypes.bool,
  field: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
};

export default RenderImageField;
