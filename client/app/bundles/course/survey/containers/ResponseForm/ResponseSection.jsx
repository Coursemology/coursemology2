import React, { PropTypes } from 'react';
import { FieldArray } from 'redux-form';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import ResponseAnswer from './ResponseAnswer';

const styles = {
  card: {
    marginBottom: 50,
  },
};

class ResponseSection extends React.Component {
  static propTypes = {
    member: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
    fields: PropTypes.shape({
      get: PropTypes.func.isRequired,
    }).isRequired,
    disabled: PropTypes.bool.isRequired,
  }

  static renderAnswers(props) {
    const { fields, disabled } = props;
    return (
      <CardText>
        {
          fields.map((member, index) => {
            const answer = fields.get(index);
            return (
              <ResponseAnswer
                key={answer.id || `q${answer.question.id}`}
                {...{ member, index, fields, disabled }}
              />
            );
          })
        }
      </CardText>
    );
  }

  render() {
    const { member, index, fields, disabled } = this.props;
    const section = fields.get(index);

    if (section.answers.length < 1) {
      return <div />;
    }

    return (
      <Card style={styles.card}>
        <CardTitle
          title={section.title}
          subtitle={<div dangerouslySetInnerHTML={{ __html: section.description }} />}
        />
        <FieldArray
          name={`${member}.answers`}
          component={ResponseSection.renderAnswers}
          disabled={disabled}
        />
      </Card>
    );
  }
}

export default ResponseSection;
