import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import PropTypes from 'prop-types';

import { sectionShape, surveyShape } from 'course/survey/propTypes';

import DeleteSectionButton from './DeleteSectionButton';
import EditSectionButton from './EditSectionButton';
import MoveDownButton from './MoveDownButton';
import MoveUpButton from './MoveUpButton';
import NewQuestionButton from './NewQuestionButton';
import Question from './Question';

const styles = {
  card: {
    marginBottom: 15,
  },
  subtitle: {
    paddingRight: 64,
  },
};

const translations = defineMessages({
  noQuestions: {
    id: 'course.surveys.SectionCard.noQuestions',
    defaultMessage:
      'This section has no questions. Empty sections will not be shown in the survey \
      response form.',
  },
});

class SectionCard extends Component {
  constructor(props) {
    super(props);
    this.state = { expanded: true };
  }

  renderActions() {
    const { section, first, last, disabled, index: sectionIndex } = this.props;
    return (
      <CardActions>
        {section.canCreateQuestion ? (
          <NewQuestionButton sectionId={section.id} {...{ disabled }} />
        ) : null}
        {section.canUpdate ? (
          <EditSectionButton {...{ section, disabled }} />
        ) : null}
        {section.canDelete ? (
          <DeleteSectionButton sectionId={section.id} {...{ disabled }} />
        ) : null}
        {section.canUpdate && !first ? (
          <MoveUpButton {...{ sectionIndex, disabled }} />
        ) : null}
        {section.canUpdate && !last ? (
          <MoveDownButton {...{ sectionIndex, disabled }} />
        ) : null}
      </CardActions>
    );
  }

  render() {
    const {
      section,
      index: sectionIndex,
      survey: { draggedQuestion },
    } = this.props;
    return (
      <Card
        expanded={this.state.expanded}
        onExpandChange={(value) => this.setState({ expanded: value })}
        style={styles.card}
      >
        <CardTitle
          showExpandableButton={section.questions.length > 0}
          subtitle={
            <div dangerouslySetInnerHTML={{ __html: section.description }} />
          }
          subtitleStyle={styles.subtitle}
          title={section.title}
        />
        {section.questions.length > 1 ? this.renderActions() : null}
        <CardText>
          {section.questions.length < 1 ? (
            <Subheader>
              <FormattedMessage {...translations.noQuestions} />
            </Subheader>
          ) : null}
          {section.questions.map((question, index) => (
            <Question
              key={question.id}
              expanded={this.state.expanded}
              {...{ question, index, sectionIndex, draggedQuestion }}
            />
          ))}
        </CardText>
        {this.renderActions()}
      </Card>
    );
  }
}

SectionCard.propTypes = {
  survey: surveyShape,
  section: sectionShape,
  index: PropTypes.number.isRequired,
  first: PropTypes.bool.isRequired,
  last: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default SectionCard;
