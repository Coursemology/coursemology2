import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button } from '@mui/material';
import { downloadSurvey } from 'course/survey/actions/surveys';

const translations = defineMessages({
  download: {
    id: 'course.surveys.ResponseIndex.DownloadResponse.download',
    defaultMessage: 'Download Responses',
  },
});

const styles = {
  button: {
    marginRight: 15,
  },
};

const DownloadResponsesButton = ({ dispatch }) => (
  <Button
    variant="outlined"
    onClick={() => dispatch(downloadSurvey())}
    style={styles.button}
  >
    <FormattedMessage {...translations.download} />
  </Button>
);

DownloadResponsesButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(DownloadResponsesButton);
