import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { Field } from 'redux-form';
import IconButton from 'material-ui/IconButton';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import PhotoIcon from 'material-ui/svg-icons/image/photo';
import TextField from 'lib/components/redux-form/TextField';
import { grey700, grey600 } from 'material-ui/styles/colors';
import Thumbnail from 'course/survey/components/Thumbnail';

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
    width: 'auto',
  },
  optionTextfield: {
    width: '100%',
  },
  optionBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '70%',
  },
  imageUploaderLabel: {
    position: 'relative',
  },
  imageUploader: {
    cursor: 'pointer',
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    left: 0,
    width: '100%',
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

class QuestionFormOption extends React.Component {
  static renderImageField(props) {
    const { input, index, disabled } = props;
    const fieldId = `option-${index}-image-field`;
    return (
      <label style={styles.imageUploaderLabel} htmlFor={fieldId}>
        <IconButton {...{ disabled }}>
          <PhotoIcon color={grey700} />
        </IconButton>
        <input
          id={fieldId}
          type="file"
          style={styles.imageUploader}
          onChange={(event) => {
            const image = event.target.files[0];
            input.onChange(image);
            input.onBlur(image);
          }}
          {...{ disabled }}
        />
      </label>
    );
  }

  renderOptionBody() {
    const { intl, member, index, fields, disabled } = this.props;
    const fieldValue = fields.get(index);
    const imageFile = fieldValue && fieldValue.file;

    const fileOrSrc = {};
    let imageFileName = '';
    let placeholder = intl.formatMessage(optionTranslations.noCaption, { index: index + 1 });

    if (imageFile) {
      fileOrSrc.file = imageFile;
      imageFileName = imageFile.name;
    } else if (fieldValue.image_url) {
      fileOrSrc.src = fieldValue.image_url;
      imageFileName = fieldValue.image_name;
    } else {
      placeholder = intl.formatMessage(optionTranslations.optionPlaceholder, { index: index + 1 });
    }

    return (
      <div style={styles.optionBody}>
        {
          fileOrSrc.file || fileOrSrc.src ?
            <Thumbnail
              {...fileOrSrc}
              style={styles.image}
              containerStyle={styles.imageContainer}
            /> : null
        }
        <small>{imageFileName}</small>
        <Field
          multiLine
          name={`${member}.option`}
          component={TextField}
          style={styles.optionTextfield}
          {...{ placeholder, disabled }}
        />
      </div>
    );
  }

  renderWidget() {
    const { multipleResponse, multipleChoice } = this.props;
    let widget = null;
    if (multipleChoice) {
      widget = <RadioButton disabled style={styles.widget} />;
    } else if (multipleResponse) {
      widget = <Checkbox disabled style={styles.widget} />;
    }
    return widget;
  }

  render() {
    const { member, index, fields, disabled, addToOptionsToDelete } = this.props;
    const fieldValue = fields.get(index);
    const handleRemove = () => {
      fields.remove(index);
      if (fieldValue.id) {
        addToOptionsToDelete(fieldValue);
      }
      if (fields.length <= 1) {
        fields.push({});
      }
    };

    return (
      <div key={index} style={styles.option}>
        { this.renderWidget() }
        { this.renderOptionBody() }
        <Field
          name={`${member}.file`}
          component={QuestionFormOption.renderImageField}
          {...{ index, disabled }}
        />
        <IconButton onTouchTap={handleRemove} {...{ disabled }}>
          <CloseIcon color={grey600} />
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
