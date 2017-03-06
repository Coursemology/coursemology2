import React, { PropTypes } from 'react';
import { Card, CardText } from 'material-ui/Card';
import { defineMessages, FormattedMessage } from 'react-intl';
import Toggle from 'material-ui/Toggle';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import { cyan500, grey50, grey300 } from 'material-ui/styles/colors';
import { sorts } from '../../utils';
import { questionTypes } from '../../constants';
import { optionShape } from '../../propTypes';
import Thumbnail from '../../components/Thumbnail';


const styles = {
  percentageBarThreshold: 10,
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
};

const translations = defineMessages({
  serial: {
    id: 'course.surveys.QuestionResults.serial',
    defaultMessage: 'S/N',
  },
  count: {
    id: 'course.surveys.QuestionResults.count',
    defaultMessage: 'Count',
  },
  percentage: {
    id: 'course.surveys.QuestionResults.percentage',
    defaultMessage: 'Percentage',
  },
  sortByPercentage: {
    id: 'course.surveys.QuestionResults.sortByPercentage',
    defaultMessage: 'Sort By Percentage',
  },
  responses: {
    id: 'course.surveys.QuestionResults.responses',
    defaultMessage: 'Responses',
  },
  multipleChoiceOption: {
    id: 'course.surveys.QuestionResults.multipleChoiceOption',
    defaultMessage: 'Multiple Choice Option',
  },
  multipleResponseOption: {
    id: 'course.surveys.QuestionResults.multipleResponseOption',
    defaultMessage: 'Multiple Response Option',
  },
});

class QuestionResults extends React.Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    includePhantoms: PropTypes.bool.isRequired,
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
        <TableRowColumn colSpan={3}>
          { optionText || imageName || null }
        </TableRowColumn>
        <TableRowColumn>{breakdown[id].count}</TableRowColumn>
        <TableRowColumn colSpan={6}>
          {QuestionResults.renderPercentageBar(percentage)}
        </TableRowColumn>
      </TableRow>
    );
  }

  constructor(props) {
    super(props);
    this.state = { sortByPercentage: false };
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
      <Table>
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>
              <FormattedMessage {...translations.serial} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={(hasImage ? 1 : 0) + 3}>
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
            QuestionResults.renderOptionRow(breakdown, hasImage, option, index)
          )}
        </TableBody>
      </Table>
    );
  }

  renderTextResults() {
    const { includePhantoms, question: { answers } } = this.props;
    const filteredAnswers = includePhantoms ? answers : answers.filter(answer => !answer.phantom);
    return (
      <Table height="300px">
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          <TableRow>
            <TableHeaderColumn>
              <FormattedMessage {...translations.serial} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan={15}>
              <FormattedMessage {...translations.responses} />
            </TableHeaderColumn>
          </TableRow>
        </TableHeader>
        <TableBody displayRowCheckbox={false}>
          {filteredAnswers.map((answer, index) => (
            <TableRow key={answer.id}>
              <TableRowColumn>{ index + 1 }</TableRowColumn>
              <TableRowColumn colSpan={15}>{ answer.text_response }</TableRowColumn>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  renderMultipleChoiceResults() {
    return (
      <div>
        {this.renderOptionsResultsTable()}
      </div>
    );
  }

  renderMultipleResponseResults() {
    return (
      <div>
        {this.renderOptionsResultsTable()}
      </div>
    );
  }

  renderSpecificResults() {
    const { question } = this.props;
    const { TEXT, MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const renderer = {
      [TEXT]: this.renderTextResults,
      [MULTIPLE_CHOICE]: this.renderMultipleChoiceResults,
      [MULTIPLE_RESPONSE]: this.renderMultipleResponseResults,
    }[question.question_type];

    if (!renderer) { return null; }
    return renderer.call(this);
  }

  render() {
    const { question, index } = this.props;

    return (
      <Card style={styles.card}>
        <CardText>
          {`${index + 1}. ${question.description}`}
        </CardText>
        {this.renderSpecificResults()}
      </Card>
    );
  }
}

export default QuestionResults;
