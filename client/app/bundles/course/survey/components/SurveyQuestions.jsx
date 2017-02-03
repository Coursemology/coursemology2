import React, { PropTypes } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import Subheader from 'material-ui/Subheader';
import Thumbnail from './Thumbnail';
import sorts from '../utils';
import { questionTypes } from '../constants';
import surveyTranslations from '../translations';

const translations = defineMessages({
  empty: {
    id: 'course.surveys.SurveyQuestions.empty',
    defaultMessage: 'This survey does not have any questions.',
  },
});

const styles = {
  option: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  optionWidget: {
    width: 'auto',
  },
  image: {
    maxHeight: 150,
    maxWidth: 400,
  },
  optionBody: {
    display: 'flex',
    flexDirection: 'column',
  },
};

class SurveyQuestions extends React.Component {
  static renderQuestionCard(question, specificFields) {
    return (
      <Card key={question.id}>
        <CardText>
          <p>{question.description}</p>
          {specificFields}
        </CardText>
      </Card>
    );
  }

  static renderOptions(question, Widget) {
    const { byWeight } = sorts;
    return (
      <div>
        { question.options.sort(byWeight).map(option => (
          <div key={option.id} style={styles.option}>
            <Widget disabled style={styles.optionWidget} />
            <div style={styles.optionBody}>
              { option.image ?
                <Thumbnail src={option.image} style={styles.image} /> : [] }
              { option.option ? option.option : '' }
            </div>
          </div>
        ))}
      </div>
    );
  }

  static renderQuestion(question) {
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;

    let specificFields;
    switch (question.question_type.toString()) {
      case MULTIPLE_CHOICE:
        specificFields = SurveyQuestions.renderOptions(question, RadioButton);
        break;
      case MULTIPLE_RESPONSE:
        specificFields = SurveyQuestions.renderOptions(question, Checkbox);
        break;
      case TEXT:
      default:
        specificFields = null;
    }

    return SurveyQuestions.renderQuestionCard(question, specificFields);
  }

  render() {
    const { intl, questions } = this.props;
    const { byWeight } = sorts;

    if (!questions || questions.length < 1) {
      return <Subheader>{ intl.formatMessage(translations.empty) }</Subheader>;
    }

    return (
      <div>
        <Subheader>{ intl.formatMessage(surveyTranslations.questions) }</Subheader>
        { questions.sort(byWeight).map(SurveyQuestions.renderQuestion) }
      </div>
    );
  }
}

SurveyQuestions.propTypes = {
  questions: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number.isRequired,
    description: PropTypes.string.isRequired,
    weight: PropTypes.number.isRequired,
    question_type: PropTypes.number.isRequired,
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      weight: PropTypes.number,
      option: PropTypes.string,
      image: PropTypes.string,
    })),
  })),
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
};

export default injectIntl(SurveyQuestions);
