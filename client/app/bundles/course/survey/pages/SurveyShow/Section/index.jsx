import { Component } from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { defineMessages, FormattedMessage } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  ListSubheader,
} from '@mui/material';
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
  expandIcon: {
    float: 'right',
  },
  expandIconRotated: {
    float: 'right',
    transform: 'rotate(180deg)',
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

class Section extends Component {
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
    const { section, index: sectionIndex } = this.props;
    return (
      <Card style={styles.card}>
        <CardHeader
          subheader={
            <div dangerouslySetInnerHTML={{ __html: section.description }} />
          }
          subheaderTypographyProps={{ style: styles.subtitle }}
          title={
            <>
              {section.title}
              {section.questions.length > 0 && (
                <ExpandMoreIcon
                  onClick={() =>
                    this.setState((prevState) => ({
                      expanded: !prevState.expanded,
                    }))
                  }
                  style={
                    this.state.expanded
                      ? styles.expandIcon
                      : styles.expandIconRotated
                  }
                />
              )}
            </>
          }
        />
        {section.questions.length > 1 ? this.renderActions() : null}

        <CardContent>
          {section.questions.length < 1 ? (
            <ListSubheader disableSticky>
              <FormattedMessage {...translations.noQuestions} />
            </ListSubheader>
          ) : null}

          <Droppable droppableId={`section-${sectionIndex}`}>
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {section.questions.map((question, index) => (
                  <Question
                    key={question.id}
                    expanded={this.state.expanded}
                    {...{ question, index, sectionIndex }}
                  />
                ))}

                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </CardContent>

        {this.renderActions()}
      </Card>
    );
  }
}

Section.propTypes = {
  survey: surveyShape,
  section: sectionShape,
  index: PropTypes.number.isRequired,
  first: PropTypes.bool.isRequired,
  last: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default Section;
