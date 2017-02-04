import React, { PropTypes } from 'react';
import { Card, CardText } from 'material-ui/Card';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import Thumbnail from './Thumbnail';
import sorts from '../utils';
import { questionTypes } from '../constants';

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
  adminMenu: {
    position: 'absolute',
    right: 24,
  },
};

class QuestionCard extends React.Component {
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

  static renderSpecificFields(question) {
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const renderer = {
      [MULTIPLE_CHOICE]: () => QuestionCard.renderOptions(question, RadioButton),
      [MULTIPLE_RESPONSE]: () => QuestionCard.renderOptions(question, Checkbox),
    }[question.question_type];
    return renderer ? renderer() : null;
  }

  render() {
    const { question } = this.props;
    return (
      <Card>
        <CardText>
          <p>{question.description}</p>
          {QuestionCard.renderSpecificFields(question)}
        </CardText>
      </Card>
    );
  }

}

QuestionCard.propTypes = {
  question: PropTypes.shape({
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
  }),
};

export default QuestionCard;
