import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FormattedMessage, injectIntl } from 'react-intl';
import { Button, Card, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import ConfirmationDialog from 'lib/components/core/dialogs/ConfirmationDialog';

import { formNames } from '../../constants';
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
    graderView,
    handleSaveGrade,
    onSubmit,
    handleUnsubmit,
    intl,
    isSaving,
    published,
    submitted,
  } = props;

  const { handleSubmit } = useForm();

  const needShowSubmitButton = attempting && canUpdate;
  const needShowUnsubmitButton = graderView && (submitted || published);
  if (!needShowSubmitButton && !needShowUnsubmitButton) {
    return null;
  }

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
        color="primary"
        disabled={isSaving}
        onClick={handleSaveGrade}
        style={styles.formButton}
        variant="contained"
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
        <Typography variant="body2">
          <FormattedMessage {...translations.submitNoQuestionExplain} />
        </Typography>

        <Button
          color="primary"
          disabled={isSaving}
          form={formNames.SUBMISSION}
          style={styles.formButton}
          type="submit"
          variant="contained"
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
        color="secondary"
        disabled={isSaving}
        onClick={() => setUnsubmitConfirmation(true)}
        style={styles.formButton}
        variant="contained"
      >
        {intl.formatMessage(translations.unsubmit)}
      </Button>
    );
  };

  const renderUnsubmitDialog = () => (
    <ConfirmationDialog
      message={intl.formatMessage(translations.unsubmitConfirmation)}
      onCancel={() => setUnsubmitConfirmation(false)}
      onConfirm={() => {
        setUnsubmitConfirmation(false);
        handleUnsubmit();
      }}
      open={unsubmitConfirmation}
    />
  );

  return (
    <Card style={styles.questionCardContainer}>
      <form id={formNames.SUBMISSION} onSubmit={handleSubmit(onSubmit)}>
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
  intl: PropTypes.object.isRequired,

  graderView: PropTypes.bool.isRequired,
  canUpdate: PropTypes.bool.isRequired,

  attempting: PropTypes.bool.isRequired,
  submitted: PropTypes.bool.isRequired,
  published: PropTypes.bool.isRequired,
  isSaving: PropTypes.bool.isRequired,

  handleSaveGrade: PropTypes.func,
  handleUnsubmit: PropTypes.func,
  onSubmit: PropTypes.func,
};

export default injectIntl(SubmissionEmptyForm);
