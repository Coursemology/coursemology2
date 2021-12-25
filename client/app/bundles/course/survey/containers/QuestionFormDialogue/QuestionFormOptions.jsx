/* eslint-disable react/no-array-index-key */
import { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';

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

class QuestionFormOptions extends Component {
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
  };

  render() {
    const { intl, fields, disabled, ...props } = this.props;

    return (
      <>
        {fields.map((member, index) => (
          <QuestionFormOption
            key={index}
            {...{ member, index, fields, disabled, ...props }}
          />
        ))}
        <div style={styles.buttons}>
          <FlatButton
            label={intl.formatMessage(optionsTranslations.addOption)}
            onClick={() => fields.push({})}
            primary={true}
            {...{ disabled }}
          />
          <FlatButton
            containerElement="label"
            label={intl.formatMessage(optionsTranslations.bulkUploadImages)}
            primary={true}
            {...{ disabled }}
          >
            <input
              multiple={true}
              onChange={this.handleSelectFiles}
              style={styles.imageUploader}
              type="file"
              {...{ disabled }}
            />
          </FlatButton>
        </div>
      </>
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
