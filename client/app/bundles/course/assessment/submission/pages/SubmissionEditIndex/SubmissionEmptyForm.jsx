import { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Button, Card } from '@mui/material';
import history from 'lib/history';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import GradingPanel from '../../containers/GradingPanel';
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

const SubmissionEmptyForm = (props) => {
  const [unsubmitConfirmation, setUnsubmitConfirmation] = useState(false);
  const {
    attempting,
    canUpdate,
    categoryId,
    courseId,
    graderView,
    handleSaveGrade,
    handleSubmit,
    handleUnsubmit,
    intl,
    isSaving,
    published,
    submitted,
    tabId,
  } = props;

  const needShowSubmitButton = attempting && canUpdate;
  const needShowUnsubmitButton = graderView && (submitted || published);
  if (!needShowSubmitButton && !needShowUnsubmitButton) {
    return null;
  }

  const submitAndRedirect = () => {
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

  const renderGradingPanel = () => {
    if (!attempting) {
      return <GradingPanel />;
    }
    return null;
  };

  const renderSaveGradeButton = () => {
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
  };

  const renderSubmitButton = () => {
    if (attempting && canUpdate) {
      return (
        <div style={styles.submitContainer}>
          <FormattedMessage {...translations.submitNoQuestionExplain} />
          <Button
            variant="contained"
            color="primary"
            disabled={isSaving}
            onClick={submitAndRedirect}
            style={styles.formButton}
          >
            {intl.formatMessage(translations.ok)}
          </Button>
        </div>
      );
    }
    return null;
  };

  const renderUnsubmitButton = () => {
    if (graderView && (submitted || published)) {
      return (
        <Button
          variant="contained"
          color="secondary"
          disabled={isSaving}
          onClick={() => setUnsubmitConfirmation(true)}
          style={styles.formButton}
        >
          {intl.formatMessage(translations.unsubmit)}
        </Button>
      );
    }
    return null;
  };

  const renderUnsubmitDialog = () => (
    <ConfirmationDialog
      open={unsubmitConfirmation}
      onCancel={() => setUnsubmitConfirmation(false)}
      onConfirm={() => {
        setUnsubmitConfirmation(false);
        handleUnsubmit();
      }}
      message={intl.formatMessage(translations.unsubmitConfirmation)}
    />
  );

  return (
    <Card style={styles.questionCardContainer}>
      {renderGradingPanel()}
      {renderSaveGradeButton()}
      {renderSubmitButton()}
      {renderUnsubmitButton()}
      {renderUnsubmitDialog()}
    </Card>
  );
};

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

export default injectIntl(SubmissionEmptyForm);
