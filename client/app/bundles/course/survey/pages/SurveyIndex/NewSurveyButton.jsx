import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { injectIntl, defineMessages } from 'react-intl';
import moment from 'lib/moment';
import { showSurveyForm, createSurvey } from 'course/survey/actions/surveys';
import { formatSurveyFormData } from 'course/survey/utils';
import AddButton from 'course/survey/components/AddButton';

const translations = defineMessages({
  newSurvey: {
    id: 'course.surveys.NewSurveyButton.title',
    defaultMessage: 'New Survey',
  },
  success: {
    id: 'course.surveys.NewSurveyButton.success',
    defaultMessage: 'Survey "{title}" created.',
  },
  failure: {
    id: 'course.surveys.NewSurveyButton.failure',
    defaultMessage: 'Failed to create survey.',
  },
});

const propTypes = {
  dispatch: PropTypes.func.isRequired,
  canCreate: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
};

const aWeekStartingTomorrow = () => {
  const startAt = moment().add(1, 'd').startOf('day');
  const endAt = moment(startAt).add(6, 'd').endOf('day').startOf('minute');

  return {
    start_at: startAt.toDate(),
    end_at: endAt.toDate(),
  };
};

const NewSurveyButton = (props) => {
  const { canCreate } = props;
  const navigate = useNavigate();

  const createSurveyHandler = (data) => {
    const { dispatch, intl } = props;

    const payload = formatSurveyFormData(data);
    const successMessage = intl.formatMessage(translations.success, data);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(
      createSurvey(payload, successMessage, failureMessage, navigate),
    );
  };

  const showNewSurveyForm = () => {
    const { dispatch, intl } = props;

    return dispatch(
      showSurveyForm({
        onSubmit: createSurveyHandler,
        formTitle: intl.formatMessage(translations.newSurvey),
        initialValues: {
          base_exp: 0,
          allow_response_after_end: true,
          ...aWeekStartingTomorrow(),
        },
      }),
    );
  };

  return canCreate ? <AddButton onClick={showNewSurveyForm} /> : <div />;
};

NewSurveyButton.propTypes = propTypes;

export default connect((state) => state.surveysFlags)(
  injectIntl(NewSurveyButton),
);
