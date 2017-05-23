/* eslint-disable react/no-array-index-key */
import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import QuestionFormOption from './QuestionFormOption';

const styles = {
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

class QuestionFormOptions extends React.Component {
  handleSelectFiles = (event) => {
    const { fields } = this.props;
    const options = fields.getAll();
    const files = event.target.files;

    // eliminate blank options
    fields.removeAll();
    options.forEach((option) => {
      if (option.option || option.file) {
        fields.push(option);
      }
    });

    for (let i = 0; i < files.length; i += 1) {
      fields.push({ file: files[i] });
    }
  }

  render() {
    const { intl, fields, disabled, ...props } = this.props;

    return (
      <div>
        {fields.map((member, index) => (
          <QuestionFormOption
            key={index}
            {...{ member, index, fields, disabled, ...props }}
          />
        ))}
        <div style={styles.buttons}>
          <FlatButton
            primary
            label={intl.formatMessage(optionsTranslations.addOption)}
            onTouchTap={() => fields.push({})}
            {...{ disabled }}
          />
          <FlatButton
            primary
            containerElement="label"
            label={intl.formatMessage(optionsTranslations.bulkUploadImages)}
            {...{ disabled }}
          >
            <input
              type="file"
              style={styles.imageUploader}
              onChange={this.handleSelectFiles}
              multiple
              {...{ disabled }}
            />
          </FlatButton>
        </div>
      </div>
    );
  }
}

QuestionFormOptions.propTypes = {
  intl: intlShape.isRequired,
  disabled: PropTypes.bool,
  fields: PropTypes.shape({
    map: PropTypes.func.isRequired,
    getAll: PropTypes.func.isRequired,
    removeAll: PropTypes.func.isRequired,
    push: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(QuestionFormOptions);
