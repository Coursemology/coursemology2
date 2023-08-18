import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Droppable } from '@hello-pangea/dnd';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  ListSubheader,
  Typography,
} from '@mui/material';
import PropTypes from 'prop-types';

import { sectionShape } from 'course/survey/propTypes';

import DeleteSectionButton from './DeleteSectionButton';
import EditSectionButton from './EditSectionButton';
import MoveDownButton from './MoveDownButton';
import MoveUpButton from './MoveUpButton';
import NewQuestionButton from './NewQuestionButton';
import Question from './Question';

const translations = defineMessages({
  noQuestions: {
    id: 'course.survey.Section.noQuestions',
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
        {section.canCreateQuestion && (
          <NewQuestionButton sectionId={section.id} {...{ disabled }} />
        )}
        {section.canUpdate && <EditSectionButton {...{ section, disabled }} />}
        {section.canDelete && (
          <DeleteSectionButton sectionId={section.id} {...{ disabled }} />
        )}
        {section.canUpdate && !first && (
          <MoveUpButton {...{ sectionIndex, disabled }} />
        )}
        {section.canUpdate && !last && (
          <MoveDownButton {...{ sectionIndex, disabled }} />
        )}
      </CardActions>
    );
  }

  render() {
    const { section, index: sectionIndex } = this.props;
    return (
      <Card>
        <CardHeader
          subheader={
            <Typography
              dangerouslySetInnerHTML={{ __html: section.description }}
              variant="body2"
            />
          }
          title={
            <div className="flex justify-between">
              {section.title}
              {section.questions.length > 0 && (
                <ExpandMoreIcon
                  className={!this.state.expanded && 'rotate-180'}
                  onClick={() =>
                    this.setState((prevState) => ({
                      expanded: !prevState.expanded,
                    }))
                  }
                />
              )}
            </div>
          }
        />
        {section.questions.length > 1 && this.renderActions()}

        <CardContent>
          {section.questions.length === 0 && (
            <ListSubheader disableSticky>
              <FormattedMessage {...translations.noQuestions} />
            </ListSubheader>
          )}

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
  section: sectionShape,
  index: PropTypes.number.isRequired,
  first: PropTypes.bool.isRequired,
  last: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default Section;
