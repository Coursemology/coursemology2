import { Component } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import {
  Button,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import PropTypes from 'prop-types';

import Link from 'lib/components/core/Link';

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
    id: 'course.survey.TextResponseResults.serial',
    defaultMessage: 'S/N',
  },
  respondent: {
    id: 'course.survey.TextResponseResults.respondent',
    defaultMessage: 'Respondent',
  },
  responses: {
    id: 'course.survey.TextResponseResults.responses',
    defaultMessage: 'Responses',
  },
  showResponses: {
    id: 'course.survey.TextResponseResults.showResponses',
    defaultMessage:
      'Show Responses ({quantity}/{total} responded{phantoms, plural, \
      =0 {} one {, {phantoms} Phantom} other {, {phantoms} Phantoms}})',
  },
  hideResponses: {
    id: 'course.survey.TextResponseResults.hideResponses',
    defaultMessage: 'Hide Responses',
  },
  phantomStudentName: {
    id: 'course.survey.TextResponseResults.phantomStudentName',
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
          onClick={() =>
            this.setState((state) => ({ expanded: !state.expanded }))
          }
          variant="outlined"
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
    const { answers, anonymous } = this.props;
    const nonEmptyAnswers = answers.filter(
      (answer) =>
        answer.text_response && answer.text_response.trim().length > 0,
    );
    const validPhantomResponses = nonEmptyAnswers.filter(
      (answer) => answer.phantom,
    );
    const toggle = this.renderExpandToggle({
      total: answers.length,
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
