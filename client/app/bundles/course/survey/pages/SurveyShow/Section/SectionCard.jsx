import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardText, CardTitle, CardActions } from 'material-ui/Card';
import Subheader from 'material-ui/Subheader';
import { surveyShape, sectionShape } from 'course/survey/propTypes';
import Question from './Question';
import NewQuestionButton from './NewQuestionButton';
import EditSectionButton from './EditSectionButton';
import DeleteSectionButton from './DeleteSectionButton';
import MoveUpButton from './MoveUpButton';
import MoveDownButton from './MoveDownButton';

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

class SectionCard extends React.Component {
  static propTypes = {
    survey: surveyShape,
    section: sectionShape,
    index: PropTypes.number.isRequired,
    first: PropTypes.bool.isRequired,
    last: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { expanded: true };
  }

  renderActions() {
    const { section, first, last, disabled, index: sectionIndex } = this.props;
    return (
      <CardActions>
        { section.canCreateQuestion ? <NewQuestionButton sectionId={section.id} {...{ disabled }} /> : null }
        { section.canUpdate ? <EditSectionButton {...{ section, disabled }} /> : null }
        { section.canDelete ? <DeleteSectionButton sectionId={section.id} {...{ disabled }} /> : null }
        { section.canUpdate && !first ? <MoveUpButton {...{ sectionIndex, disabled }} /> : null }
        { section.canUpdate && !last ? <MoveDownButton {...{ sectionIndex, disabled }} /> : null }
      </CardActions>
    );
  }

  render() {
    const { section, index: sectionIndex, survey: { draggedQuestion } } = this.props;
    return (
      <Card
        style={styles.card}
        expanded={this.state.expanded}
        onExpandChange={value => this.setState({ expanded: value })}
      >
        <CardTitle
          title={section.title}
          subtitle={<div dangerouslySetInnerHTML={{ __html: section.description }} />}
          subtitleStyle={styles.subtitle}
          showExpandableButton={section.questions.length > 0}
        />
        { section.questions.length > 1 ? this.renderActions() : null }
        <CardText>
          {
            section.questions.length < 1 ?
              <Subheader><FormattedMessage {...translations.noQuestions} /></Subheader> : null
          }
          {
            section.questions.map((question, index) =>
              (<Question
                key={question.id}
                expanded={this.state.expanded}
                {...{ question, index, sectionIndex, draggedQuestion }}
              />)
            )
          }
        </CardText>
        { this.renderActions() }
      </Card>
    );
  }
}

export default SectionCard;
