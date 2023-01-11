import { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { DragIndicator } from '@mui/icons-material';
import MoreVert from '@mui/icons-material/MoreVert';
import {
  Accordion,
  AccordionSummary,
  CardContent,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  Radio,
  TextField,
} from '@mui/material';
import PropTypes from 'prop-types';

import OptionsListItem from 'course/survey/components/OptionsListItem';
import { questionTypes } from 'course/survey/constants';
import { questionShape } from 'course/survey/propTypes';
import translations from 'course/survey/translations';
import formTranslations from 'lib/translations/form';

class QuestionCard extends Component {
  static renderOptionsFields(question) {
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const widget = {
      [MULTIPLE_CHOICE]: Radio,
      [MULTIPLE_RESPONSE]: Checkbox,
    }[question.question_type];
    if (!widget) {
      return null;
    }
    return question.grid_view
      ? QuestionCard.renderOptionsGrid(question, widget)
      : QuestionCard.renderOptionsList(question, widget);
  }

  static renderOptionsGrid(question, Widget) {
    return (
      <div className="flex flex-wrap">
        {question.options.map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const widget = <Widget className="mt-0 w-auto p-0" disabled />;
          return (
            <OptionsListItem
              key={option.id}
              grid
              {...{ optionText, imageUrl, widget }}
            />
          );
        })}
      </div>
    );
  }

  static renderOptionsList(question, Widget) {
    return (
      <>
        {question.options.map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const widget = <Widget className="mt-0 w-auto p-0" disabled />;
          return (
            <OptionsListItem
              key={option.id}
              {...{ optionText, imageUrl, widget }}
            />
          );
        })}
      </>
    );
  }

  static renderSpecificFields(question) {
    const { TEXT } = questionTypes;
    if (question.question_type === TEXT) {
      return QuestionCard.renderTextField();
    }
    return QuestionCard.renderOptionsFields(question);
  }

  static renderTextField() {
    return (
      <TextField
        disabled
        fullWidth
        label={<FormattedMessage {...translations.textResponse} />}
        variant="standard"
      />
    );
  }

  constructor(props) {
    super(props);
    this.state = { anchorEl: null };
  }

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  renderAdminMenu() {
    const { adminFunctions } = this.props;

    if (!adminFunctions || adminFunctions.length < 1) {
      return null;
    }

    return (
      <>
        <IconButton
          className="absolute right-8 top-5"
          onClick={this.handleClick}
        >
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={this.state.anchorEl}
          disableAutoFocusItem
          id="question-admin-menu"
          onClick={this.handleClose}
          onClose={this.handleClose}
          open={Boolean(this.state.anchorEl)}
        >
          {adminFunctions.map(({ label, handler }) => (
            <MenuItem key={label} onClick={handler}>
              {label}
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }

  render() {
    const { question, dragging, expanded } = this.props;

    return (
      <Accordion expanded={expanded}>
        <AccordionSummary className="p-0">
          <div className="flex">
            <DragIndicator
              className={dragging ? 'invisible' : 'visible'}
              color="disabled"
              fontSize="small"
            />
            <div className="flex-col">
              <p dangerouslySetInnerHTML={{ __html: question.description }} />
              {question.required && (
                <p className="italic">
                  <FormattedMessage {...formTranslations.starRequired} />
                </p>
              )}
              <CardContent className="mt-0 pt-0">
                {QuestionCard.renderSpecificFields(question)}
              </CardContent>
            </div>
          </div>
          {this.renderAdminMenu()}
        </AccordionSummary>
      </Accordion>
    );
  }
}

QuestionCard.propTypes = {
  question: questionShape,
  dragging: PropTypes.bool,
  adminFunctions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      handler: PropTypes.func,
    }),
  ),
  expanded: PropTypes.bool.isRequired,
};

export default QuestionCard;
