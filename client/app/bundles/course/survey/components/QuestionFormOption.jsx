import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Field } from 'redux-form';
import IconButton from 'material-ui/IconButton';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import CloseIcon from 'material-ui/svg-icons/navigation/close';
import PhotoIcon from 'material-ui/svg-icons/image/photo';
import TextField from 'lib/components/redux-form/TextField';
import { grey700, grey600 } from 'material-ui/styles/colors';
import Thumbnail from './Thumbnail';

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

const styleConstants = {
  alignLeftMiddle: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
};

const styles = {
  option: styleConstants.alignLeftMiddle,
  widget: {
    width: 'auto',
  },
  optionTextfield: {
    width: '100%',
  },
  textOptionBody: {
    ...styleConstants.alignLeftMiddle,
    width: '70%',
  },
  imageOptionBody: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '70%',
    marginTop: 50,
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

  static renderTextField(member, placeholder, disabled) {
    return (
      <Field
        multiLine
        name={`${member}.option`}
        component={TextField}
        style={styles.optionTextfield}
        {...{ placeholder, disabled }}
      />
    );
  }

  renderTextOption(member, index, disabled) {
    const { intl } = this.props;
    const placeholder =
      intl.formatMessage(optionTranslations.optionPlaceholder, { index: index + 1 });

    return (
      <div style={styles.textOptionBody}>
        { QuestionFormOption.renderTextField(member, placeholder, disabled) }
        <Field
          name={`${member}.image`}
          component={QuestionFormOption.renderImageField}
          {...{ index, disabled }}
        />
      </div>
    );
  }

  renderImageOption(member, index, disabled, imageFile) {
    const { intl } = this.props;
    const placeholder =
      intl.formatMessage(optionTranslations.noCaption, { index: index + 1 });

    return (
      <div style={styles.imageOptionBody}>
        <Thumbnail file={imageFile} style={styles.image} />
        <small>{imageFile.name}</small>
        { QuestionFormOption.renderTextField(member, placeholder, disabled) }
        <Field
          name={`${member}.image`}
          component="input"
          type="hidden"
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
    const { member, index, fields, disabled } = this.props;
    const fieldValue = fields.get(index);

    return (
      <div key={index} style={styles.option}>
        { this.renderWidget() }
        {
          fieldValue && fieldValue.image ?
          this.renderImageOption(member, index, disabled, fieldValue.image) :
          this.renderTextOption(member, index, disabled)
        }
        <IconButton onTouchTap={() => fields.remove(index)} {...{ disabled }}>
          <CloseIcon color={grey600} />
        </IconButton>
      </div>
    );
  }
}

QuestionFormOption.propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  disabled: PropTypes.bool,
  multipleChoice: PropTypes.bool,
  multipleResponse: PropTypes.bool,
  member: PropTypes.string.isRequired,
  index: PropTypes.number.isRequired,
  fields: PropTypes.shape({
    get: PropTypes.func.isRequired,
    remove: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(QuestionFormOption);
