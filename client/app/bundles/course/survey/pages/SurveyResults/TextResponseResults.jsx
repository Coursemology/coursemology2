import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { defineMessages, FormattedMessage } from 'react-intl';
import { CardText } from 'material-ui/Card';
import RaisedButton from 'material-ui/RaisedButton';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';

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
    defaultMessage: 'Show Responses ({quantity}/{total} responded{phantoms, plural, \
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

class TextResponseResults extends React.Component {
  static propTypes = {
    includePhantoms: PropTypes.bool.isRequired,
    anonymous: PropTypes.bool.isRequired,
    answers: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      course_user_id: PropTypes.number,
      course_user_name: PropTypes.string,
      phantom: PropTypes.bool,
      question_option_ids: PropTypes.arrayOf(PropTypes.number),
    })),
  }

  static renderStudentName(answer) {
    return (
      <Link to={answer.response_path}>
        {
          answer.phantom ?
            <FormattedMessage
              {...translations.phantomStudentName}
              values={{ name: answer.course_user_name }}
            /> :
            answer.course_user_name
        }
      </Link>
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
              anonymous ? null :
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
                anonymous ? null :
                <TableRowColumn colSpan={5} style={styles.wrapText}>
                  { TextResponseResults.renderStudentName(answer) }
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

    const expandable = props.answers.length > styles.expandableThreshold;
    this.state = {
      expandable,
      expanded: !expandable,
    };
  }

  renderExpandToggle(values) {
    if (!this.state.expandable) { return null; }
    const labelTranslation = this.state.expanded ? 'hideResponses' : 'showResponses';
    return (
      <CardText style={styles.expandToggleStyle}>
        <RaisedButton
          label={<FormattedMessage {...translations[labelTranslation]} values={values} />}
          onTouchTap={() => this.setState({ expanded: !this.state.expanded })}
        />
      </CardText>
    );
  }

  render() {
    const { includePhantoms, answers, anonymous } = this.props;
    const filteredAnswers = includePhantoms ? answers : answers.filter(answer => !answer.phantom);
    const nonEmptyAnswers = filteredAnswers.filter(answer => (
      answer.text_response && answer.text_response.trim().length > 0
    ));
    const validPhantomResponses = includePhantoms ? nonEmptyAnswers.filter(answer => answer.phantom) : [];
    const toggle = this.renderExpandToggle({
      total: filteredAnswers.length,
      quantity: nonEmptyAnswers.length,
      phantoms: validPhantomResponses.length,
    });

    return (
      <div>
        { toggle }
        { this.state.expanded && TextResponseResults.renderTextResultsTable(nonEmptyAnswers, anonymous) }
        { this.state.expanded && toggle }
      </div>
    );
  }
}

export default TextResponseResults;
