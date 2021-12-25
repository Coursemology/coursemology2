import { defineMessages, FormattedMessage } from 'react-intl';
import { connect } from 'react-redux';
import RaisedButton from 'material-ui/RaisedButton';
import PropTypes from 'prop-types';

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
  <RaisedButton
    label={<FormattedMessage {...translations.download} />}
    onClick={() => dispatch(downloadSurvey())}
    style={styles.button}
  />
);

DownloadResponsesButton.propTypes = {
  dispatch: PropTypes.func.isRequired,
};

export default connect()(DownloadResponsesButton);
