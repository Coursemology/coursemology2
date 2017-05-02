import React, { PropTypes } from 'react';
import { Card, CardText } from 'material-ui/Card';
import { defineMessages, FormattedMessage } from 'react-intl';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { cyan500, grey50, grey300 } from 'material-ui/styles/colors';
import formTranslations from 'lib/translations/form';
import { sorts } from 'course/survey/utils';
import { questionTypes } from 'course/survey/constants';
import { optionShape } from 'course/survey/propTypes';
import Thumbnail from 'course/survey/components/Thumbnail';

const styles = {
  percentageBarThreshold: 10,
  optionThresholdQuantity: 10,
  card: {
    marginBottom: 15,
  },
  image: {
    maxHeight: 80,
    maxWidth: 80,
  },
  imageContainer: {
    margin: 10,
    height: 80,
    width: 80,
  },
  bar: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: cyan500,
    color: grey50,
    height: 24,
    borderRadius: 5,
  },
  barContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: grey300,
    width: '100%',
    height: 24,
    borderRadius: 5,
  },
  percentage: {
    marginLeft: 5,
    color: cyan500,
    fontWeight: 'bold',
  },
  percentageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sortByPercentage: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  expandToggleStyle: {
    display: 'flex',
    justifyContent: 'center',
  },
  wrapText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
  tableWrapper: {
    overflow: 'inherit',
  },
  required: {
    fontStyle: 'italic',
  },
};

const translations = defineMessages({
  serial: {
    id: 'course.surveys.ResultsQuestion.serial',
    defaultMessage: 'S/N',
  },
  respondent: {
    id: 'course.surveys.ResultsQuestion.respondent',
    defaultMessage: 'Respondent',
  },
  count: {
    id: 'course.surveys.ResultsQuestion.count',
    defaultMessage: 'Count',
  },
  percentage: {
    id: 'course.surveys.ResultsQuestion.percentage',
    defaultMessage: 'Percentage',
  },
  sortByPercentage: {
    id: 'course.surveys.ResultsQuestion.sortByPercentage',
    defaultMessage: 'Sort By Percentage',
  },
  responses: {
    id: 'course.surveys.ResultsQuestion.responses',
    defaultMessage: 'Responses',
  },
  multipleChoiceOption: {
    id: 'course.surveys.ResultsQuestion.multipleChoiceOption',
    defaultMessage: 'Multiple Choice Option',
  },
  multipleResponseOption: {
    id: 'course.surveys.ResultsQuestion.multipleResponseOption',
    defaultMessage: 'Multiple Response Option',
  },
  showResponses: {
    id: 'course.surveys.ResultsQuestion.showResponses',
    defaultMessage: 'Show Responses ({quantity}/{total} responded{phantoms, plural, \
      =0 {} one {, {phantoms} Phantom} other {, {phantoms} Phantoms}})',
  },
  hideResponses: {
    id: 'course.surveys.ResultsQuestion.hideResponses',
    defaultMessage: 'Hide Responses',
  },
  showOptions: {
    id: 'course.surveys.ResultsQuestion.showOptions',
    defaultMessage: 'Show All {quantity} Options',
  },
  hideOptions: {
    id: 'course.surveys.ResultsQuestion.hideOptions',
    defaultMessage: 'Hide All {quantity} Options',
  },
  phantomStudentName: {
    id: 'course.surveys.ResultsQuestion.phantomStudentName',
    defaultMessage: '{name} (Phantom)',
  },
});

class ResultsQuestion extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    includePhantoms: PropTypes.bool.isRequired,
    anonymous: PropTypes.bool.isRequired,
    question: PropTypes.shape({
      id: PropTypes.number,
      description: PropTypes.string,
      weight: PropTypes.number,
      question_type: PropTypes.string,
      required: PropTypes.bool,
      max_options: PropTypes.number,
      min_options: PropTypes.number,
      options: PropTypes.arrayOf(optionShape),
      answers: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        course_user_name: PropTypes.string,
        phantom: PropTypes.bool,
        selected_options: PropTypes.arrayOf(PropTypes.number),
      })),
    }).isRequired,
  }

  static renderPercentageBar(percentage) {
    return (
      <div style={styles.barContainer}>
        <div style={{ ...styles.bar, width: `${percentage}%` }}>
          {
            percentage >= styles.percentageBarThreshold ?
            `${percentage.toFixed(1)}%` : null
          }
        </div>
        {
          percentage < styles.percentageBarThreshold ?
            <span style={styles.percentage}>{`${percentage.toFixed(1)}%`}</span> :
          null
        }
      </div>
    );
  }

  static renderOptionRow(breakdown, hasImage, option, index) {
    const percentage = (100 * breakdown[option.id].count) / breakdown.length;
    const { id, option: optionText, image_url: imageUrl, image_name: imageName } = option;

    return (
      <TableRow key={id}>
        <TableRowColumn>{index + 1}</TableRowColumn>
        {
          hasImage ?
            <TableRowColumn>
              { imageUrl ?
                <Thumbnail
                  src={imageUrl}
                  style={styles.image}
                  containerStyle={styles.imageContainer}
                /> : [] }
            </TableRowColumn> : null
        }
        <TableRowColumn colSpan={hasImage ? 3 : 6} style={styles.wrapText}>
          { optionText || imageName || null }
        </TableRowColumn>
        <TableRowColumn>{breakdown[id].count}</TableRowColumn>
        <TableRowColumn colSpan={6}>
          {ResultsQuestion.renderPercentageBar(percentage)}
        </TableRowColumn>
      </TableRow>
    );
  }

  static renderTextResultsTable(answers, anonymous) {
    return (
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn colSpan={2}>
              <FormattedMessage {...translations.serial} />
            </TableHeaderColumn>
            {
              anonymous ||
              <TableHeaderColumn colSpan={5}>
                <FormattedMessage {...translations.respondent} />
              </TableHeaderColumn>
            }
            <TableHeaderColumn colSpan={15}>
              <FormattedMessage {...translations.responses} />
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {answers.map((answer, index) => (
            <TableRow key={answer.id}>
              <TableRowColumn colSpan={2}>
                { index + 1 }
              </TableRowColumn>
              {
                anonymous ||
                <TableRowColumn colSpan={5} style={styles.wrapText}>
                  {
                    answer.phantom ?
                      <FormattedMessage
                        {...translations.phantomStudentName}
                        values={{ name: answer.course_user_name }}
                      /> :
                    answer.course_user_name
                  }
                </TableRowColumn>
              }
              <TableRowColumn colSpan={15} style={styles.wrapText}>
                { answer.text_response }
              </TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  constructor(props) {
    super(props);
    const { question: { question_type: questionType, answers, options } } = props;
    const maxRows = questionType === questionTypes.TEXT ? answers.length : options.length;
    const expandable = maxRows > styles.optionThresholdQuantity;
    this.state = {
      expandable,
      expanded: !expandable,
      sortByPercentage: false,
    };
  }

  /**
   * Computes the list and count of students that selected each option for the current question.
   */
  getOptionsBreakdown() {
    const { includePhantoms, question: { options, answers } } = this.props;
    const breakdown = { length: answers.length };
    options.forEach((option) => {
      breakdown[option.id] = { count: 0, names: [] };
    });
    answers.forEach((answer) => {
      answer.selected_options.forEach((selectedOption) => {
        if (!includePhantoms && answer.phantom) { return; }
        breakdown[selectedOption].count += 1;
        breakdown[selectedOption].names.push(answer.course_user_name);
      });
    });
    return breakdown;
  }

  renderExpandToggle(values) {
    if (!this.state.expandable) { return null; }

    const { question } = this.props;
    let labelTranslation;
    if (question.question_type === questionTypes.TEXT) {
      labelTranslation = this.state.expanded ? 'hideResponses' : 'showResponses';
    } else {
      labelTranslation = this.state.expanded ? 'hideOptions' : 'showOptions';
    }

    return (
      <CardText style={styles.expandToggleStyle}>
        <RaisedButton
          label={<FormattedMessage {...translations[labelTranslation]} values={values} />}
          onTouchTap={() => this.setState({ expanded: !this.state.expanded })}
        />
      </CardText>
    );
  }

  renderOptionsResultsTable() {
    const { question: { options, question_type: questionType } } = this.props;
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const { byWeight } = sorts;
    const breakdown = this.getOptionsBreakdown();
    const optionsHeaderTranslation = {
      [MULTIPLE_CHOICE]: translations.multipleChoiceOption,
      [MULTIPLE_RESPONSE]: translations.multipleResponseOption,
    }[questionType];
    const hasImage = options.some(option => option.image_url);
    const sortByCount = (a, b) => breakdown[b.id].count - breakdown[a.id].count;
    const sortMethod = this.state.sortByPercentage ? sortByCount : byWeight;

    return (
      <Table wrapperStyle={styles.tableWrapper}>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>
              <FormattedMessage {...translations.serial} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={hasImage ? 4 : 6}>
              <FormattedMessage {...optionsHeaderTranslation} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.count} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={6} >
              <div style={styles.percentageHeader} >
                <FormattedMessage {...translations.percentage} />
                <div style={styles.sortByPercentage}>
                  <FormattedMessage {...translations.sortByPercentage} />
                  <Toggle onToggle={(_, value) => this.setState({ sortByPercentage: value })} />
                </div>
              </div>
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {options.sort(sortMethod).map((option, index) =>
            ResultsQuestion.renderOptionRow(breakdown, hasImage, option, index)
          )}
        </TableBody>
      </Table>
    );
  }

  renderTextResults() {
    const { includePhantoms, question: { answers }, anonymous } = this.props;
    const filteredAnswers = includePhantoms ? answers : answers.filter(answer => !answer.phantom);
    const nonEmptyAnswers = filteredAnswers.filter(answer => (
      answer.text_response && answer.text_response.trim().length > 0
    ));
    const sortedAnswers = anonymous ? nonEmptyAnswers :
      nonEmptyAnswers.sort((a, b) => a.course_user_name.localeCompare(b.course_user_name));
    const validPhantomResponses = includePhantoms ? sortedAnswers.filter(answer => answer.phantom) : [];
    const toggle = this.renderExpandToggle({
      total: filteredAnswers.length,
      quantity: sortedAnswers.length,
      phantoms: validPhantomResponses.length,
    });

    return (
      <div>
        { toggle }
        { this.state.expanded ? ResultsQuestion.renderTextResultsTable(sortedAnswers, anonymous) : null }
        { this.state.expanded ? toggle : null}
      </div>
    );
  }

  renderOptionsResults() {
    const optionsCount = this.props.question.options.length;
    const toggle = this.renderExpandToggle({ quantity: optionsCount });
    return (
      <div>
        { toggle }
        { this.state.expanded ? this.renderOptionsResultsTable() : null }
        { this.state.expanded ? toggle : null }
      </div>
    );
  }

  renderSpecificResults() {
    const { question } = this.props;
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const renderer = {
      [TEXT]: this.renderTextResults,
      [MULTIPLE_CHOICE]: this.renderOptionsResults,
      [MULTIPLE_RESPONSE]: this.renderOptionsResults,
    }[question.question_type];

    if (!renderer) { return null; }
    return renderer.call(this);
  }

  render() {
    const { question, index } = this.props;

    return (
      <Card style={styles.card}>
        <CardText>
          <p>{ `${index + 1}. ${question.description}` }</p>
          { question.required ?
            <p style={styles.required}><FormattedMessage {...formTranslations.starRequired} /></p> : null }
        </CardText>
        {this.renderSpecificResults()}
      </Card>
    );
  }
}

export default ResultsQuestion;
