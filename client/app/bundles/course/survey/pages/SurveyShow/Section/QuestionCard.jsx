import { Component } from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
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
import MoreVert from '@mui/icons-material/MoreVert';
import formTranslations from 'lib/translations/form';
import { questionTypes } from 'course/survey/constants';
import { questionShape } from 'course/survey/propTypes';
import translations from 'course/survey/translations';
import OptionsListItem from 'course/survey/components/OptionsListItem';

const styles = {
  optionWidget: {
    padding: 0,
    width: 'auto',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  gridOptionWidget: {
    marginTop: 5,
    padding: 0,
    width: 'auto',
  },
  adminMenu: {
    position: 'absolute',
    right: 8,
    top: 0,
  },
  card: {
    marginBottom: 15,
  },
  fields: {
    marginTop: 0,
    paddingTop: 0,
  },
  panelSummaryText: {
    flexDirection: 'column',
  },
  required: {
    fontStyle: 'italic',
  },
};

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
      <div style={styles.grid}>
        {question.options.map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const widget = <Widget disabled style={styles.gridOptionWidget} />;
          return (
            <OptionsListItem
              grid
              key={option.id}
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
          const widget = <Widget disabled style={styles.optionWidget} />;
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
    this.state = { anchorEl: null, hovered: false };
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
        <IconButton onClick={this.handleClick} style={styles.adminMenu}>
          <MoreVert />
        </IconButton>
        <Menu
          id="question-admin-menu"
          anchorEl={this.state.anchorEl}
          disableAutoFocusItem
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
    const { question, expanded } = this.props;
    const cursorStyle = this.state.hovered ? { cursor: 'move' } : null;
    return (
      <Accordion
        expanded={expanded}
        onMouseOver={() => this.setState({ hovered: true })}
        onMouseOut={() => this.setState({ hovered: false })}
        style={{ ...styles.card, ...cursorStyle }}
      >
        <AccordionSummary>
          <div style={styles.panelSummaryText}>
            <p dangerouslySetInnerHTML={{ __html: question.description }} />
            {question.required ? (
              <p style={styles.required}>
                <FormattedMessage {...formTranslations.starRequired} />
              </p>
            ) : null}
          </div>
          {this.renderAdminMenu()}
        </AccordionSummary>
        <CardContent style={styles.fields}>
          {QuestionCard.renderSpecificFields(question)}
        </CardContent>
      </Accordion>
    );
  }
}

QuestionCard.propTypes = {
  question: questionShape,
  adminFunctions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      handler: PropTypes.func,
    }),
  ),
  expanded: PropTypes.bool.isRequired,
};

export default QuestionCard;
