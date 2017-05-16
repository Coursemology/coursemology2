import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import { Card, CardText } from 'material-ui/Card';
import TextField from 'material-ui/TextField';
import Checkbox from 'material-ui/Checkbox';
import RadioButton from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import formTranslations from 'lib/translations/form';
import { questionTypes } from 'course/survey/constants';
import { questionShape } from 'course/survey/propTypes';
import translations from 'course/survey/translations';
import OptionsListItem from 'course/survey/components/OptionsListItem';

const styles = {
  optionWidget: {
    width: 'auto',
  },
  grid: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  gridOptionWidget: {
    marginTop: 5,
    width: 'auto',
  },
  gridOptionWidgetIcon: {
    margin: 0,
  },
  adminMenu: {
    position: 'absolute',
    right: 8,
    top: 12,
  },
  cardText: {
    position: 'relative',
    paddingTop: 34,
    paddingRight: 64,
  },
  card: {
    marginBottom: 15,
  },
  textField: {
    width: '100%',
  },
  fields: {
    marginTop: 0,
  },
  required: {
    fontStyle: 'italic',
  },
};

class QuestionCard extends React.Component {
  static propTypes = {
    question: questionShape,
    adminFunctions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      handler: PropTypes.func,
    })),
    expanded: PropTypes.bool.isRequired,
  };

  static renderOptionsList(question, Widget) {
    return (
      <div>
        {question.options.map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const widget = <Widget disabled style={styles.optionWidget} />;
          return <OptionsListItem key={option.id} {...{ optionText, imageUrl, widget }} />;
        })}
      </div>
    );
  }

  static renderOptionsGrid(question, Widget) {
    return (
      <div style={styles.grid}>
        { question.options.map((option) => {
          const { option: optionText, image_url: imageUrl } = option;
          const widget = (
            <Widget
              disabled
              style={styles.gridOptionWidget}
              iconStyle={styles.gridOptionWidgetIcon}
            />
          );
          return <OptionsListItem grid key={option.id} {...{ optionText, imageUrl, widget }} />;
        })}
      </div>
    );
  }

  static renderOptionsFields(question) {
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const widget = {
      [MULTIPLE_CHOICE]: RadioButton,
      [MULTIPLE_RESPONSE]: Checkbox,
    }[question.question_type];
    if (!widget) { return null; }
    return question.grid_view ?
      QuestionCard.renderOptionsGrid(question, widget) :
      QuestionCard.renderOptionsList(question, widget);
  }

  static renderTextField() {
    return (
      <TextField
        disabled
        style={styles.textField}
        hintText={<FormattedMessage {...translations.textResponse} />}
      />
    );
  }

  static renderSpecificFields(question) {
    const { TEXT } = questionTypes;
    if (question.question_type === TEXT) {
      return QuestionCard.renderTextField();
    }
    return QuestionCard.renderOptionsFields(question);
  }

  constructor(props) {
    super(props);
    this.state = { hovered: false };
  }

  renderAdminMenu() {
    const { adminFunctions } = this.props;

    if (!adminFunctions || adminFunctions.length < 1) {
      return null;
    }

    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        style={styles.adminMenu}
      >
        {adminFunctions.map(({ label, handler }) =>
          <MenuItem key={label} primaryText={label} onTouchTap={handler} />
        )}
      </IconMenu>
    );
  }

  render() {
    const { question, expanded } = this.props;
    const cursorStyle = this.state.hovered ? { cursor: 'move' } : null;
    return (
      <Card
        style={{ ...styles.card, ...cursorStyle }}
        onMouseOver={() => this.setState({ hovered: true })}
        onMouseOut={() => this.setState({ hovered: false })}
        {...{ expanded }}
      >
        <CardText style={styles.cardText}>
          { this.renderAdminMenu() }
          <p dangerouslySetInnerHTML={{ __html: question.description }} />
          { question.required ?
            <p style={styles.required}><FormattedMessage {...formTranslations.starRequired} /></p> : null }
        </CardText>
        <CardText expandable style={styles.fields}>
          { QuestionCard.renderSpecificFields(question) }
        </CardText>
      </Card>
    );
  }
}

export default QuestionCard;
