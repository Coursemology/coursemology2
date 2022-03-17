import { Component } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { Field } from 'redux-form';
import { Checkbox, IconButton, Radio } from '@material-ui/core';
import { grey } from '@material-ui/core/colors';
import Close from '@material-ui/icons/Close';
import Photo from '@material-ui/icons/Photo';
import renderTextField from 'lib/components/redux-form/TextField';
import Thumbnail from 'lib/components/Thumbnail';

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

class QuestionFormOption extends Component {
  renderImageField = (fieldProps) => {
    const { input, index, disabled } = fieldProps;
    const fieldId = `option-${index}-image-field`;
    return (
      <div style={styles.imageUploaderDiv}>
        <label htmlFor={fieldId}>
          <IconButton
            disabled={disabled}
            onClick={() => this.fileInput.click()}
          >
            <Photo htmlColor={disabled ? undefined : grey[700]} />
          </IconButton>
        </label>
        <input
          id={fieldId}
          type="file"
          style={styles.imageUploader}
          onChange={(event) => {
            const image = event.target.files[0];
            input.onChange(image);
            input.onBlur(image);
          }}
          ref={(field) => {
            this.fileInput = field;
          }}
          {...{ disabled }}
        />
      </div>
    );
  };

  renderOptionBody() {
    const { intl, member, index, fields, disabled } = this.props;
    const fieldValue = fields.get(index);
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
            style={styles.image}
            containerStyle={styles.imageContainer}
          />
        ) : null}
        <small>{imageFileName}</small>
        <Field
          fullWidth
          multiline
          name={`${member}.option`}
          component={renderTextField}
          {...{ placeholder, disabled }}
        />
      </div>
    );
  }

  renderWidget() {
    const { multipleResponse, multipleChoice } = this.props;
    let widget = null;
    if (multipleChoice) {
      widget = <Radio disabled style={styles.widget} />;
    } else if (multipleResponse) {
      widget = <Checkbox disabled style={styles.widget} />;
    }
    return widget;
  }

  render() {
    const { member, index, fields, disabled, addToOptionsToDelete } =
      this.props;
    const fieldValue = fields.get(index);
    const handleRemove = () => {
      fields.remove(index);
      if (fieldValue.id) {
        addToOptionsToDelete(fieldValue);
      }
      // eslint-disable-next-line react/prop-types
      if (fields.length <= 1) {
        // eslint-disable-next-line react/prop-types
        fields.push({});
      }
    };

    return (
      <div key={index} style={styles.option}>
        {this.renderWidget()}
        {this.renderOptionBody()}
        <Field
          name={`${member}.file`}
          component={this.renderImageField}
          {...{ index, disabled }}
        />
        <IconButton disabled={disabled} onClick={handleRemove}>
          <Close htmlColor={disabled ? undefined : grey[600]} />
        </IconButton>
      </div>
    );
  }
}

QuestionFormOption.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  multipleChoice: PropTypes.bool,
  multipleResponse: PropTypes.bool,
  member: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  fields: PropTypes.shape({
    get: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }).isRequired,
  addToOptionsToDelete: PropTypes.func.isRequired,
};

export default injectIntl(QuestionFormOption);
