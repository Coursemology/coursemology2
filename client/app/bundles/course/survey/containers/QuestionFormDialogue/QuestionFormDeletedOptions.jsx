import Close from '@mui/icons-material/Close';
import { Checkbox, IconButton, Radio } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import Thumbnail from 'lib/components/core/Thumbnail';

const styles = {
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  widget: {
    padding: 0,
    width: 'auto',
  },
  optionBody: {
    color: grey[600],
    width: '60%',
  },
  image: {
    maxHeight: 48,
    maxWidth: 48,
  },
  imageContainer: {
    marginRight: 24,
    height: 48,
    width: 48,
  },
  imageSpacer: {
    width: 72,
  },
};

const handleRestore = (remove, index, field, optionsAppend) => {
  remove(index);
  optionsAppend({ ...field });
};

const QuestionFormDeletedOptions = (props) => {
  const {
    disabled,
    fieldsConfig,
    multipleChoice,
    multipleResponse,
    optionsAppend,
  } = props;
  const { fields, remove } = fieldsConfig;

  if (!fields || fields.length < 1) {
    return null;
  }

  const renderWidget = () => {
    let widget = null;
    if (multipleChoice) {
      widget = <Radio disabled={true} style={styles.widget} />;
    } else if (multipleResponse) {
      widget = <Checkbox disabled={true} style={styles.widget} />;
    }
    return widget;
  };

  return (
    <>
      {fields.map((field, index) => (
        <div key={field.id} style={styles.option}>
          {renderWidget()}
          {field.image_url ? (
            <Thumbnail
              containerStyle={styles.imageContainer}
              src={field.image_url}
              style={styles.image}
            />
          ) : (
            <div style={styles.imageSpacer} />
          )}
          <span style={styles.optionBody}>{field.option}</span>
          <IconButton
            disabled={disabled}
            onClick={() => handleRestore(remove, index, field, optionsAppend)}
          >
            <Close htmlColor={disabled ? undefined : grey[600]} />
          </IconButton>
        </div>
      ))}
    </>
  );
};

QuestionFormDeletedOptions.propTypes = {
  disabled: PropTypes.bool,
  fieldsConfig: PropTypes.shape({
    control: PropTypes.object.isRequired,
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    append: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }),
  multipleChoice: PropTypes.bool,
  multipleResponse: PropTypes.bool,
  optionsAppend: PropTypes.func.isRequired,
};

export default QuestionFormDeletedOptions;
