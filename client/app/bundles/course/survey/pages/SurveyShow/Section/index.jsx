import React from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardText, CardTitle, CardActions } from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import { sorts } from '../../../utils';
import { sectionShape } from '../../../propTypes';
import Question from './Question';
import NewQuestionButton from './NewQuestionButton';

const styles = {
  card: {
    marginBottom: 15,
  },
};

const translations = defineMessages({
  noQuestions: {
    id: 'course.surveys.Section.noQuestions',
    defaultMessage:
      'This section has no questions. Empty sections will not be shown in the survey \
      response form.',
  },
});

class Section extends React.Component {
  static propTypes = {
    section: sectionShape,
  }

  constructor(props) {
    super(props);
    this.state = { expanded: true };
  }

  render() {
    const { section } = this.props;
    const { byWeight } = sorts;
    return (
      <Card
        style={styles.card}
        expanded={this.state.expanded}
        onExpandChange={value => this.setState({ expanded: value })}
      >
        <CardTitle
          title={section.title}
          subtitle={section.description}
          showExpandableButton={section.questions.length > 0}
        />
        <CardText>
          {
            section.questions.length < 1 ?
              <Subheader><FormattedMessage {...translations.noQuestions} /></Subheader> : null
          }
          {
            section.questions.sort(byWeight).map(question =>
              <Question
                key={question.id}
                expanded={this.state.expanded}
                {...{ question }}
              />
            )
          }
        </CardText>
        <CardActions>
          { section.canCreateQuestion ? <NewQuestionButton sectionId={section.id} /> : null }
        </CardActions>
      </Card>
    );
  }
}

export default Section;
