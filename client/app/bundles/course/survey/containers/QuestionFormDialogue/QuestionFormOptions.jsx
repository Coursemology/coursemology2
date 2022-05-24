import { memo } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import QuestionFormOption from './QuestionFormOption';

const styles = {
  imageUploader: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    opacity: 0,
  },
  buttons: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 15,
  },
};

const optionsTranslations = defineMessages({
  addOption: {
    id: 'course.surveys.QuestionForm.addOption',
    defaultMessage: 'Add Option',
  },
  bulkUploadImages: {
    id: 'course.surveys.QuestionForm.bulkUploadImages',
    defaultMessage: 'Bulk Upload Images',
  },
});

const handleSelectFiles = (event, fieldsConfig) => {
  const { append } = fieldsConfig;
  const files = event.target.files;

  for (let i = 0; i < files.length; i += 1) {
    append({
      weight: null,
      option: '',
      image_url: '',
      image_name: '',
      file: files[i],
    });
  }
};

const QuestionFormOptions = (props) => {
  const {
    fieldsConfig,
    disabled,
    multipleChoice,
    multipleResponse,
    deletedOptionsAppend,
  } = props;
  const { append, fields } = fieldsConfig;

  return (
    <>
      {fields.map((field, index) => (
        <QuestionFormOption
          key={field.id}
          {...{
            field,
            index,
            fieldsConfig,
            disabled,
            multipleChoice,
            multipleResponse,
            deletedOptionsAppend,
          }}
        />
      ))}
      <div style={styles.buttons}>
        <Button
          color="primary"
          disabled={disabled}
          onClick={() =>
            append({
              weight: null,
              option: '',
              image_url: '',
              image_name: '',
              file: null,
            })
          }
        >
          <FormattedMessage {...optionsTranslations.addOption} />
        </Button>
        <Button color="primary" component="label" disabled={disabled}>
          <FormattedMessage {...optionsTranslations.bulkUploadImages} />
          <input
            type="file"
            style={styles.imageUploader}
            onChange={(event) => handleSelectFiles(event, fieldsConfig)}
            multiple
            {...{ disabled }}
          />
        </Button>
      </div>
    </>
  );
};

QuestionFormOptions.propTypes = {
  disabled: PropTypes.bool,
  fieldsConfig: PropTypes.shape({
    control: PropTypes.object.isRequired,
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    append: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }),
  multipleChoice: PropTypes.bool,
  multipleResponse: PropTypes.bool,
  deletedOptionsAppend: PropTypes.func.isRequired,
};

export default memo(QuestionFormOptions, (prevProps, nextProps) => {
  if (
    prevProps.multipleChoice !== nextProps.multipleChoice ||
    prevProps.multipleResponse !== nextProps.multipleResponse
  ) {
    return false;
  }

  const prevOptions = prevProps.fieldsConfig.fields;
  const nextOptions = nextProps.fieldsConfig.fields;
  if (prevOptions.length !== nextOptions.length) {
    return false;
  }
  const shallowCompare = (obj1, obj2) =>
    Object.keys(obj1).length === Object.keys(obj2).length &&
    Object.keys(obj1).every(
      (key) =>
        Object.prototype.hasOwnProperty.call(obj2, key) &&
        obj1[key] === obj2[key],
    );

  for (let i = 0; i < prevOptions.length; i++) {
    if (!shallowCompare(prevOptions[i], nextOptions[i])) {
      return false;
    }
  }
  return true;
});
