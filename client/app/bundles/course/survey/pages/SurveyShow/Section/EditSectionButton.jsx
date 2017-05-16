import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { injectIntl, defineMessages, intlShape, FormattedMessage } from 'react-intl';
import FlatButton from 'material-ui/FlatButton';
import { showSectionForm, updateSurveySection } from 'course/survey/actions/sections';
import { sectionShape } from 'course/survey/propTypes';

const translations = defineMessages({
  editSection: {
    id: 'course.surveys.EditSectionButton.editSection',
    defaultMessage: 'Edit Section',
  },
  success: {
    id: 'course.surveys.EditSectionButton.success',
    defaultMessage: 'Section updated.',
  },
  failure: {
    id: 'course.surveys.EditSectionButton.failure',
    defaultMessage: 'Failed to update question.',
  },
});

class EditSectionButton extends React.Component {
  static propTypes = {
    section: sectionShape,
    disabled: PropTypes.bool,

    dispatch: PropTypes.func.isRequired,
    intl: intlShape.isRequired,
  };

  static defaultProps = {
    disabled: false,
  }

  updateSectionHandler = (data) => {
    const { dispatch, section } = this.props;
    const payload = { section: data };
    const successMessage = <FormattedMessage {...translations.success} />;
    const failureMessage = <FormattedMessage {...translations.failure} />;
    return dispatch(updateSurveySection(section.id, payload, successMessage, failureMessage));
  }

  showEditSectionForm = () => {
    const { dispatch, intl, section: { title, description } } = this.props;
    return dispatch(showSectionForm({
      onSubmit: this.updateSectionHandler,
      formTitle: intl.formatMessage(translations.editSection),
      initialValues: { title, description },
    }));
  }

  render() {
    return (
      <FlatButton
        label={<FormattedMessage {...translations.editSection} />}
        onTouchTap={this.showEditSectionForm}
        disabled={this.props.disabled}
      />
    );
  }
}

export default connect()(injectIntl(EditSectionButton));
