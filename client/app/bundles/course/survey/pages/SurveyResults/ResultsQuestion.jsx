import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardText } from 'material-ui/Card';
import { FormattedMessage } from 'react-intl';
import formTranslations from 'lib/translations/form';
import { questionTypes } from 'course/survey/constants';
import { optionShape } from 'course/survey/propTypes';
import TextResponseResults from './TextResponseResults';
import OptionsQuestionResults from './OptionsQuestionResults';

const styles = {
  card: {
    marginBottom: 15,
  },
  required: {
    fontStyle: 'italic',
  },
};

class ResultsQuestion extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    includePhantoms: PropTypes.bool.isRequired,
    anonymous: PropTypes.bool.isRequired,
    question: PropTypes.shape({
      id: PropTypes.number,
      description: PropTypes.string,
      weight: PropTypes.number,
      question_type: PropTypes.string,
      required: PropTypes.bool,
      max_options: PropTypes.number,
      min_options: PropTypes.number,
      options: PropTypes.arrayOf(optionShape),
      answers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        course_user_id: PropTypes.number,
        course_user_name: PropTypes.string,
        phantom: PropTypes.bool,
        question_option_ids: PropTypes.arrayOf(PropTypes.number),
      })),
    }).isRequired,
  }

  renderTextResults() {
    const { includePhantoms, question: { answers }, anonymous } = this.props;
    return <TextResponseResults {...{ includePhantoms, answers, anonymous }} />;
  }

  renderOptionsResults() {
    const { question: { options, answers, question_type: questionType }, anonymous, includePhantoms } = this.props;
    return <OptionsQuestionResults {...{ options, answers, questionType, anonymous, includePhantoms }} />;
  }

  renderSpecificResults() {
    const { question } = this.props;
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const renderer = {
      [TEXT]: this.renderTextResults,
      [MULTIPLE_CHOICE]: this.renderOptionsResults,
      [MULTIPLE_RESPONSE]: this.renderOptionsResults,
    }[question.question_type];

    if (!renderer) { return null; }
    return renderer.call(this);
  }

  render() {
    const { question, index } = this.props;

    return (
      <Card style={styles.card}>
        <CardText>
          <p dangerouslySetInnerHTML={{ __html: `${index + 1}. ${question.description}` }} />
          { question.required ?
            <p style={styles.required}><FormattedMessage {...formTranslations.starRequired} /></p> : null }
        </CardText>
        {this.renderSpecificResults()}
      </Card>
    );
  }
}

export default ResultsQuestion;
