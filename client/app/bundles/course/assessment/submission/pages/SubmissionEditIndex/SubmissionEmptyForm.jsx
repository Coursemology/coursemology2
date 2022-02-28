import { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm } from 'redux-form';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Button, Card } from '@material-ui/core';
import history from 'lib/history';

/* eslint-disable import/extensions, import/no-extraneous-dependencies, import/no-unresolved */
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import GradingPanel from '../../containers/GradingPanel';
import { formNames } from '../../constants';
import translations from '../../translations';

const styles = {
  questionCardContainer: {
    marginTop: 20,
    padding: 40,
    width: '100%',
  },
  gradingWrapper: {
    width: '100%',
    flex: 1,
  },
  submitContainer: {
    width: 'auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  formButton: {
    marginTop: 10,
    marginBottom: 10,
    marginRight: 5,
    marginLeft: 5,
  },
};

class SubmissionEmptyForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      unsubmitConfirmation: false,
    };
  }

  submitAndRedirect = () => {
    const { handleSubmit, courseId, categoryId, tabId } = this.props;
    handleSubmit()
      .then(() =>
        history.push(
          `/courses/${courseId}/assessments?category=${categoryId}&tab=${tabId}`,
        ),
      )
      .then(() => {
        window.location.reload(true);
      });
  };

  renderGradingPanel() {
    const { attempting } = this.props;
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  }

  renderSaveGradeButton() {
    const { intl, graderView, attempting, handleSaveGrade, isSaving } =
      this.props;
    if (graderView && !attempting) {
      return (
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving}
          onClick={handleSaveGrade}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.saveGrade)}
        </Button>
      );
    }
    return null;
  }

  renderSubmitButton() {
    const { intl, canUpdate, attempting, isSaving } = this.props;
    if (attempting && canUpdate) {
      return (
        <div style={styles.submitContainer}>
          <FormattedMessage {...translations.submitNoQuestionExplain} />
          <Button
            variant="contained"
            color="primary"
            disabled={isSaving}
            onClick={this.submitAndRedirect}
            style={styles.formButton}
          >
            {intl.formatMessage(translations.ok)}
          </Button>
        </div>
      );
    }
    return null;
  }

  renderUnsubmitButton() {
    const { intl, graderView, submitted, published, isSaving } = this.props;
    if (graderView && (submitted || published)) {
      return (
        <Button
          variant="contained"
          color="secondary"
          disabled={isSaving}
          onClick={() => this.setState({ unsubmitConfirmation: true })}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.unsubmit)}
        </Button>
      );
    }
    return null;
  }

  renderUnsubmitDialog() {
    const { unsubmitConfirmation } = this.state;
    const { intl, handleUnsubmit } = this.props;
    return (
      <ConfirmationDialog
        open={unsubmitConfirmation}
        onCancel={() => this.setState({ unsubmitConfirmation: false })}
        onConfirm={() => {
          this.setState({ unsubmitConfirmation: false });
          handleUnsubmit();
        }}
        message={intl.formatMessage(translations.unsubmitConfirmation)}
      />
    );
  }

  render() {
    const { canUpdate, attempting, graderView, submitted, published } =
      this.props;
    const needShowSubmitButton = attempting && canUpdate;
    const needShowUnsubmitButton = graderView && (submitted || published);
    if (!needShowSubmitButton && !needShowUnsubmitButton) {
      return null;
    }
    return (
      <Card style={styles.questionCardContainer}>
        {this.renderGradingPanel()}
        {this.renderSaveGradeButton()}
        {this.renderSubmitButton()}
        {this.renderUnsubmitButton()}
        {this.renderUnsubmitDialog()}
      </Card>
    );
  }
}

SubmissionEmptyForm.propTypes = {
  intl: intlShape.isRequired,

  graderView: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,

  courseId: PropTypes.string.isRequired,
  categoryId: PropTypes.number.isRequired,
  tabId: PropTypes.number.isRequired,

  handleSaveGrade: PropTypes.func,
  handleSubmit: PropTypes.func,
  handleUnsubmit: PropTypes.func,
};

export default reduxForm({
  form: formNames.SUBMISSION,
})(injectIntl(SubmissionEmptyForm));
