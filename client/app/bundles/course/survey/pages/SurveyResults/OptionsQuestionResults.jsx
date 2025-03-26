import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Button,
  CardContent,
  Chip,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { cyan, grey } from '@mui/material/colors';
import PropTypes from 'prop-types';

import { questionTypes } from 'course/survey/constants';
import { optionShape } from 'course/survey/propTypes';
import { sorts } from 'course/survey/utils';
import Link from 'lib/components/core/Link';
import Thumbnail from 'lib/components/core/Thumbnail';

const styles = {
  percentageBarThreshold: 10,
  expandableThreshold: 10,
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
    backgroundColor: cyan[500],
    color: grey[50],
    height: 24,
    borderRadius: 5,
  },
  barContainer: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: grey[300],
    width: '100%',
    height: 24,
    borderRadius: 5,
  },
  percentage: {
    marginLeft: 5,
    color: cyan[500],
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
  optionStudentNames: {
    display: 'flex',
    flexWrap: 'wrap',
  },
  nameChip: {
    margin: 2,
  },
};

const translations = defineMessages({
  serial: {
    id: 'course.survey.OptionsQuestionResults.serial',
    defaultMessage: 'S/N',
  },
  respondents: {
    id: 'course.survey.OptionsQuestionResults.respondents',
    defaultMessage: 'Respondents',
  },
  count: {
    id: 'course.survey.OptionsQuestionResults.count',
    defaultMessage: 'Count',
  },
  percentage: {
    id: 'course.survey.OptionsQuestionResults.percentage',
    defaultMessage: 'Percentage',
  },
  sortByPercentage: {
    id: 'course.survey.OptionsQuestionResults.sortByPercentage',
    defaultMessage: 'Sort By Percentage',
  },
  sortByCount: {
    id: 'course.survey.OptionsQuestionResults.sortByCount',
    defaultMessage: 'Sort By Count',
  },
  multipleChoiceOption: {
    id: 'course.survey.OptionsQuestionResults.multipleChoiceOption',
    defaultMessage: 'Multiple Choice Option',
  },
  multipleResponseOption: {
    id: 'course.survey.OptionsQuestionResults.multipleResponseOption',
    defaultMessage: 'Multiple Response Option',
  },
  showOptions: {
    id: 'course.survey.OptionsQuestionResults.showOptions',
    defaultMessage: 'Show All {quantity} Options',
  },
  hideOptions: {
    id: 'course.survey.OptionsQuestionResults.hideOptions',
    defaultMessage: 'Hide All {quantity} Options',
  },
  phantomStudentName: {
    id: 'course.survey.OptionsQuestionResults.phantomStudentName',
    defaultMessage: '{name} (Phantom)',
  },
});

class OptionsQuestionResults extends Component {
  static renderOptionRow(breakdown, hasImage, option, index, anonymous) {
    const percentage = (100 * breakdown[option.id].count) / breakdown.length;
    const {
      id,
      option: optionText,
      image_url: imageUrl,
      image_name: imageName,
    } = option;

    return (
      <TableRow key={id}>
        <TableCell>{index + 1}</TableCell>
        {hasImage ? (
          <TableCell>
            {imageUrl ? (
              <Thumbnail
                containerStyle={styles.imageContainer}
                src={imageUrl}
                style={styles.image}
              />
            ) : (
              []
            )}
          </TableCell>
        ) : null}
        <TableCell colSpan={hasImage ? 3 : 6} style={styles.wrapText}>
          {optionText || imageName || null}
        </TableCell>
        <TableCell>{breakdown[id].count}</TableCell>
        <TableCell colSpan={6}>
          {anonymous
            ? OptionsQuestionResults.renderPercentageBar(percentage)
            : OptionsQuestionResults.renderStudentList(breakdown[id].students)}
        </TableCell>
      </TableRow>
    );
  }

  static renderPercentageBar(percentage) {
    return (
      <div style={styles.barContainer}>
        <div style={{ ...styles.bar, width: `${percentage}%` }}>
          {percentage >= styles.percentageBarThreshold
            ? `${percentage.toFixed(1)}%`
            : null}
        </div>
        {percentage < styles.percentageBarThreshold ? (
          <span style={styles.percentage}>{`${percentage.toFixed(1)}%`}</span>
        ) : null}
      </div>
    );
  }

  static renderStudentList(students) {
    return (
      <div style={styles.optionStudentNames}>
        {students.map((student) => (
          <Chip
            key={student.id}
            label={
              <Link to={student.response_path}>
                {student.phantom ? (
                  <FormattedMessage
                    {...translations.phantomStudentName}
                    values={{ name: student.name }}
                  />
                ) : (
                  student.name
                )}
              </Link>
            }
            style={styles.nameChip}
          />
        ))}
      </div>
    );
  }

  constructor(props) {
    super(props);

    const expandable = props.options.length > styles.expandableThreshold;
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
    const { options, answers } = this.props;
    const breakdown = { length: answers.length };
    options.forEach((option) => {
      breakdown[option.id] = { count: 0, students: [] };
    });
    answers.forEach((answer) => {
      answer.question_option_ids.forEach((selectedOption) => {
        breakdown[selectedOption].count += 1;
        breakdown[selectedOption].students.push({
          id: answer.course_user_id,
          name: answer.course_user_name,
          response_path: answer.response_path,
          phantom: answer.phantom,
        });
      });
    });
    return breakdown;
  }

  renderExpandToggle() {
    if (!this.state.expandable) {
      return null;
    }

    const labelTranslation = this.state.expanded
      ? 'hideOptions'
      : 'showOptions';
    const quantity = this.props.options.length;

    return (
      <CardContent style={styles.expandToggleStyle}>
        <Button
          onClick={() =>
            this.setState((state) => ({ expanded: !state.expanded }))
          }
          variant="outlined"
        >
          <FormattedMessage
            {...translations[labelTranslation]}
            values={{ quantity }}
          />
        </Button>
      </CardContent>
    );
  }

  renderOptionsResultsTable() {
    const { anonymous, options, questionType } = this.props;
    const { MULTIPLE_CHOICE, MULTIPLE_RESPONSE } = questionTypes;
    const { byWeight } = sorts;
    const breakdown = this.getOptionsBreakdown();
    const optionsHeaderTranslation = {
      [MULTIPLE_CHOICE]: translations.multipleChoiceOption,
      [MULTIPLE_RESPONSE]: translations.multipleResponseOption,
    }[questionType];
    const hasImage = options.some((option) => option.image_url);
    const sortByCount = (a, b) => breakdown[b.id].count - breakdown[a.id].count;
    const sortMethod = this.state.sortByPercentage ? sortByCount : byWeight;

    return (
      <Table style={styles.tableWrapper}>
        <TableHead>
          <TableRow>
            <TableCell>
              <FormattedMessage {...translations.serial} />
            </TableCell>
            <TableCell colSpan={hasImage ? 4 : 6}>
              <FormattedMessage {...optionsHeaderTranslation} />
            </TableCell>
            <TableCell>
              <FormattedMessage {...translations.count} />
            </TableCell>
            <TableCell colSpan={6}>
              <div style={styles.percentageHeader}>
                <FormattedMessage
                  {...translations[anonymous ? 'percentage' : 'respondents']}
                />
                <div style={styles.sortByPercentage}>
                  <FormattedMessage
                    {...translations[
                      anonymous ? 'sortByPercentage' : 'sortByCount'
                    ]}
                  />
                  <Switch
                    color="primary"
                    onChange={(_, value) =>
                      this.setState({ sortByPercentage: value })
                    }
                  />
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {options
            .sort(sortMethod)
            .map((option, index) =>
              OptionsQuestionResults.renderOptionRow(
                breakdown,
                hasImage,
                option,
                index,
                anonymous,
              ),
            )}
        </TableBody>
      </Table>
    );
  }

  render() {
    const toggle = this.renderExpandToggle();
    return (
      <>
        {toggle}
        {this.state.expanded && this.renderOptionsResultsTable()}
        {this.state.expanded && toggle}
      </>
    );
  }
}

OptionsQuestionResults.propTypes = {
  options: PropTypes.arrayOf(optionShape),
  anonymous: PropTypes.bool,
  questionType: PropTypes.string,
  answers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      course_user_id: PropTypes.number,
      course_user_name: PropTypes.string,
      phantom: PropTypes.bool,
      question_option_ids: PropTypes.arrayOf(PropTypes.number),
    }),
  ),
};

export default OptionsQuestionResults;
