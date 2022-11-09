import { Controller } from 'react-hook-form';
import { defineMessages, injectIntl } from 'react-intl';
import Close from '@mui/icons-material/Close';
import { Checkbox, IconButton, Radio } from '@mui/material';
import { grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import Thumbnail from 'lib/components/core/Thumbnail';
import FormTextField from 'lib/components/form/fields/TextField';

import ImageField from './components/ImageField';

const optionTranslations = defineMessages({
  optionPlaceholder: {
    id: 'course.surveys.QuestionForm.optionPlaceholder',
    defaultMessage: 'Option {index}',
  },
  noCaption: {
    id: 'course.surveys.QuestionForm.noCaption',
    defaultMessage: 'No Caption for Option {index}',
  },
});

const styles = {
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  widget: {
    padding: 0,
    marginRight: 10,
    width: 'auto',
  },
  optionBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '70%',
  },
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
  image: {
    maxHeight: 150,
    maxWidth: 400,
  },
  imageContainer: {
    marginTop: 50,
    height: 150,
  },
};

const handleRemove = (remove, index, field, deletedOptionsAppend) => {
  remove(index);

  // Append deleted options to the list of to be deleted options
  // Only for edit question form - For new question form, there is no
  // weight assigned yet.
  if (field.weight) {
    deletedOptionsAppend({ ...field });
  }
};

const QuestionFormOption = (props) => {
  const {
    fieldsConfig,
    field,
    index,
    disabled,
    multipleResponse,
    multipleChoice,
    intl,
    deletedOptionsAppend,
  } = props;

  const renderWidget = () => {
    let widget = null;
    if (multipleChoice) {
      widget = <Radio disabled={true} style={styles.widget} />;
    } else if (multipleResponse) {
      widget = <Checkbox disabled={true} style={styles.widget} />;
    }
    return widget;
  };

  const renderOptionBody = () => {
    const fieldValue = field;
    const imageFile = fieldValue && fieldValue.file;

    const fileOrSrc = {};
    let imageFileName = '';
    let placeholder = intl.formatMessage(optionTranslations.noCaption, {
      index: index + 1,
    });

    if (imageFile) {
      fileOrSrc.file = imageFile;
      imageFileName = imageFile.name;
    } else if (fieldValue.image_url) {
      fileOrSrc.src = fieldValue.image_url;
      imageFileName = fieldValue.image_name;
    } else {
      placeholder = intl.formatMessage(optionTranslations.optionPlaceholder, {
        index: index + 1,
      });
    }

    return (
      <div style={styles.optionBody}>
        {fileOrSrc.file || fileOrSrc.src ? (
          <Thumbnail
            {...fileOrSrc}
            containerStyle={styles.imageContainer}
            style={styles.image}
          />
        ) : null}
        <small>{imageFileName}</small>
        <Controller
          control={fieldsConfig.control}
          name={`options.${index}.option`}
          render={({ field: optionfield, fieldState }) => (
            <FormTextField
              disabled={disabled}
              field={optionfield}
              fieldState={fieldState}
              fullWidth={true}
              InputLabelProps={{
                shrink: true,
              }}
              multiline={true}
              placeholder={placeholder}
              variant="standard"
            />
          )}
        />
      </div>
    );
  };

  return (
    <div key={index} style={styles.option}>
      {renderWidget()}
      {renderOptionBody()}
      <Controller
        control={fieldsConfig.control}
        name={`options.${index}.file`}
        render={({ field: optionField }) => (
          <ImageField disabled={disabled} field={optionField} index={index} />
        )}
      />
      <IconButton
        disabled={disabled}
        onClick={() =>
          handleRemove(fieldsConfig.remove, index, field, deletedOptionsAppend)
        }
      >
        <Close htmlColor={disabled ? undefined : grey[600]} />
      </IconButton>
    </div>
  );
};

QuestionFormOption.propTypes = {
  disabled: PropTypes.bool,
  intl: PropTypes.object.isRequired,
  multipleChoice: PropTypes.bool,
  multipleResponse: PropTypes.bool,
  field: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  fieldsConfig: PropTypes.shape({
    control: PropTypes.object.isRequired,
    fields: PropTypes.arrayOf(PropTypes.object).isRequired,
    append: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }),
  deletedOptionsAppend: PropTypes.func.isRequired,
};

export default injectIntl(QuestionFormOption);
