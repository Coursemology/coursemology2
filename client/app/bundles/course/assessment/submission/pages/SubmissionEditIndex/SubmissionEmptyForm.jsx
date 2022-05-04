import { useState } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { useForm } from 'react-hook-form';
import { Button, Card } from '@mui/material';
import history from 'lib/history';
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

const SubmissionEmptyForm = (props) => {
  const [unsubmitConfirmation, setUnsubmitConfirmation] = useState(false);
  const {
    attempting,
    canUpdate,
    categoryId,
    courseId,
    graderView,
    handleSaveGrade,
    onSubmit,
    handleUnsubmit,
    intl,
    isSaving,
    published,
    submitted,
    tabId,
  } = props;

  const { handleSubmit } = useForm();

  const needShowSubmitButton = attempting && canUpdate;
  const needShowUnsubmitButton = graderView && (submitted || published);
  if (!needShowSubmitButton && !needShowUnsubmitButton) {
    return null;
  }

  const submitAndRedirect = () => {
    onSubmit()
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
    if (attempting) {
      return null;
    }
    return <GradingPanel />;
  };

  const renderSaveGradeButton = () => {
    const shouldRenderSaveGradeButton = graderView && !attempting;
    if (!shouldRenderSaveGradeButton) {
      return null;
    }
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
  };

  const renderSubmitButton = () => {
    const shouldRenderSubmitButton = attempting && canUpdate;
    if (!shouldRenderSubmitButton) {
      return null;
    }
    return (
      <div style={styles.submitContainer}>
        <FormattedMessage {...translations.submitNoQuestionExplain} />
        <Button
          variant="contained"
          color="primary"
          disabled={isSaving}
          form={formNames.SUBMISSION}
          type="submit"
          style={styles.formButton}
        >
          {intl.formatMessage(translations.ok)}
        </Button>
      </div>
    );
  };

  const renderUnsubmitButton = () => {
    const shouldRenderUnsubmitButton = graderView && (submitted || published);
    if (!shouldRenderUnsubmitButton) {
      return null;
    }
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
      <form
        id={formNames.SUBMISSION}
        onSubmit={handleSubmit(() => submitAndRedirect())}
      >
        {renderGradingPanel()}
        {renderSaveGradeButton()}
        {renderSubmitButton()}
        {renderUnsubmitButton()}
        {renderUnsubmitDialog()}
      </form>
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
  handleUnsubmit: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default injectIntl(SubmissionEmptyForm);
