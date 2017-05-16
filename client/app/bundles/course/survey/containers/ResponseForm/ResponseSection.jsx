import React from 'react';
import PropTypes from 'prop-types';
import { FieldArray } from 'redux-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import { red500 } from 'material-ui/styles/colors';
import ResponseAnswer from './ResponseAnswer';

const styles = {
  card: {
    marginBottom: 50,
  },
  questionCard: {
    marginBottom: 15,
  },
  errorText: {
    color: red500,
  },
};

const translations = defineMessages({
  noAnswer: {
    id: 'course.surveys.ResponseForm.ResponseSection.noAnswer',
    defaultMessage: 'Answer is missing. Question was likely created after response was made.',
  },
});

class ResponseSection extends React.Component {
  static propTypes = {
    member: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    fields: PropTypes.shape({
      get: PropTypes.func.isRequired,
    }).isRequired,
    disabled: PropTypes.bool.isRequired,
  }

  static renderQuestions(props) {
    const { fields, disabled } = props;

    return (
      <CardText>
        {
          fields.map((member, index) => {
            const question = fields.get(index);
            return (
              <Card key={question.id} style={styles.questionCard}>
                <CardText>
                  <p dangerouslySetInnerHTML={{ __html: `${index + 1}. ${question.description}` }} />
                  {
                    question.answer && question.answer.present ?
                      <ResponseAnswer {...{ member, question, disabled }} /> :
                      <div style={styles.errorText}>
                        <FormattedMessage {...translations.noAnswer} />
                      </div>
                  }
                </CardText>
              </Card>
            );
          })
        }
      </CardText>
    );
  }

  render() {
    const { member, index, fields, disabled } = this.props;
    const section = fields.get(index);

    if (section.questions.length < 1) {
      return <div />;
    }

    return (
      <Card style={styles.card}>
        <CardTitle
          title={section.title}
          subtitle={<div dangerouslySetInnerHTML={{ __html: section.description }} />}
        />
        <FieldArray
          name={`${member}.questions`}
          component={ResponseSection.renderQuestions}
          disabled={disabled}
        />
      </Card>
    );
  }
}

export default ResponseSection;
