import { defineMessages, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

import { createSurvey, showSurveyForm } from 'course/survey/actions/surveys';
import AddButton from 'lib/components/core/buttons/AddButton';
import moment from 'lib/moment';

import { formatSurveyFormData } from '../../utils';

const translations = defineMessages({
  newSurvey: {
    id: 'course.survey.NewSurveyButton.newSurvey',
    defaultMessage: 'New Survey',
  },
  success: {
    id: 'course.survey.NewSurveyButton.success',
    defaultMessage: 'Survey "{title}" created.',
  },
  failure: {
    id: 'course.survey.NewSurveyButton.failure',
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
  const { canCreate, intl } = props;
  const navigate = useNavigate();

  const createSurveyHandler = (data, setError) => {
    const { dispatch } = props;

    const payload = formatSurveyFormData(data);
    const successMessage = intl.formatMessage(translations.success, data);
    const failureMessage = intl.formatMessage(translations.failure);
    return dispatch(
      createSurvey(payload, successMessage, failureMessage, navigate, setError),
    );
  };

  const showNewSurveyForm = () => {
    const { dispatch } = props;

    return dispatch(
      showSurveyForm({
        onSubmit: createSurveyHandler,
        formTitle: intl.formatMessage(translations.newSurvey),
        initialValues: {
          title: '',
          description: '',
          ...aWeekStartingTomorrow(),
          bonus_end_at: null,
          base_exp: 0,
          time_bonus_exp: 0,
          has_todo: true,
          allow_response_after_end: true,
          allow_modify_after_submit: false,
          anonymous: false,
        },
      }),
    );
  };

  if (!canCreate) return null;

  return (
    <AddButton onClick={showNewSurveyForm}>
      {intl.formatMessage(translations.newSurvey)}
    </AddButton>
  );
};

NewSurveyButton.propTypes = propTypes;

export default connect(({ surveys }) => surveys.surveysFlags)(
  injectIntl(NewSurveyButton),
);
