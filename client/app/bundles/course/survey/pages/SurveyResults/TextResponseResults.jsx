import { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Button, CardContent } from '@material-ui/core';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

const styles = {
  expandableThreshold: 10,
  expandToggleStyle: {
    display: 'flex',
    justifyContent: 'center',
  },
  wrapText: {
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  },
};

const translations = defineMessages({
  serial: {
    id: 'course.surveys.TextResponseResults.serial',
    defaultMessage: 'S/N',
  },
  respondent: {
    id: 'course.surveys.TextResponseResults.respondent',
    defaultMessage: 'Respondent',
  },
  responses: {
    id: 'course.surveys.TextResponseResults.responses',
    defaultMessage: 'Responses',
  },
  showResponses: {
    id: 'course.surveys.TextResponseResults.showResponses',
    defaultMessage:
      'Show Responses ({quantity}/{total} responded{phantoms, plural, \
      =0 {} one {, {phantoms} Phantom} other {, {phantoms} Phantoms}})',
  },
  hideResponses: {
    id: 'course.surveys.TextResponseResults.hideResponses',
    defaultMessage: 'Hide Responses',
  },
  phantomStudentName: {
    id: 'course.surveys.TextResponseResults.phantomStudentName',
    defaultMessage: '{name} (Phantom)',
  },
});

class TextResponseResults extends Component {
  static renderStudentName(answer) {
    return (
      <Link to={answer.response_path}>
        {answer.phantom ? (
          <FormattedMessage
            {...translations.phantomStudentName}
            values={{ name: answer.course_user_name }}
          />
        ) : (
          answer.course_user_name
        )}
      </Link>
    );
  }

  static renderTextResultsTable(answers, anonymous) {
    return (
      <Table>
        <TableHead>
          <TableRow>
            <TableCell colSpan={2}>
              <FormattedMessage {...translations.serial} />
            </TableCell>
            {anonymous ? null : (
              <TableCell colSpan={5}>
                <FormattedMessage {...translations.respondent} />
              </TableCell>
            )}
            <TableCell colSpan={15}>
              <FormattedMessage {...translations.responses} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {answers.map((answer, index) => (
            <TableRow key={answer.id}>
              <TableCell colSpan={2}>{index + 1}</TableCell>
              {anonymous ? null : (
                <TableCell colSpan={5} style={styles.wrapText}>
                  {TextResponseResults.renderStudentName(answer)}
                </TableCell>
              )}
              <TableCell colSpan={15} style={styles.wrapText}>
                {answer.text_response}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  constructor(props) {
    super(props);

    const expandable = props.answers.length > styles.expandableThreshold;
    this.state = {
      expandable,
      expanded: !expandable,
    };
  }

  renderExpandToggle(values) {
    if (!this.state.expandable) {
      return null;
    }
    const labelTranslation = this.state.expanded
      ? 'hideResponses'
      : 'showResponses';
    return (
      <CardContent style={styles.expandToggleStyle}>
        <Button
          variant="contained"
          onClick={() =>
            this.setState((state) => ({ expanded: !state.expanded }))
          }
        >
          <FormattedMessage
            {...translations[labelTranslation]}
            values={values}
          />
        </Button>
      </CardContent>
    );
  }

  render() {
    const { includePhantoms, answers, anonymous } = this.props;
    const filteredAnswers = includePhantoms
      ? answers
      : answers.filter((answer) => !answer.phantom);
    const nonEmptyAnswers = filteredAnswers.filter(
      (answer) =>
        answer.text_response && answer.text_response.trim().length > 0,
    );
    const validPhantomResponses = includePhantoms
      ? nonEmptyAnswers.filter((answer) => answer.phantom)
      : [];
    const toggle = this.renderExpandToggle({
      total: filteredAnswers.length,
      quantity: nonEmptyAnswers.length,
      phantoms: validPhantomResponses.length,
    });

    return (
      <>
        {toggle}
        {this.state.expanded &&
          TextResponseResults.renderTextResultsTable(
            nonEmptyAnswers,
            anonymous,
          )}
        {this.state.expanded && toggle}
      </>
    );
  }
}

TextResponseResults.propTypes = {
  includePhantoms: PropTypes.bool.isRequired,
  anonymous: PropTypes.bool.isRequired,
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

export default TextResponseResults;
