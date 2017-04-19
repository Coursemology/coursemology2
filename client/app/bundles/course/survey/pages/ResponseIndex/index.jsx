import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Link, browserHistory } from 'react-router';
import { Card } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import { red500 } from 'material-ui/styles/colors';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import TitleBar from 'lib/components/TitleBar';
import { formatDateTime } from 'lib/date-time-defaults';
import { fetchResponses } from 'course/survey/actions/responses';
import surveyTranslations from 'course/survey/translations';
import LoadingIndicator from 'course/survey/components/LoadingIndicator';
import UnsubmitButton from 'course/survey/containers/UnsubmitButton';
import { surveyShape, responseShape } from 'course/survey/propTypes';

const styles = {
  red: {
    color: red500,
  },
  table: {
    maxWidth: 600,
  },
  detailsCard: {
    marginBottom: 30,
  },
};

const translations = defineMessages({
  name: {
    id: 'course.surveys.ResponseIndex.name',
    defaultMessage: 'Name',
  },
  responseStatus: {
    id: 'course.surveys.ResponseIndex.responseStatus',
    defaultMessage: 'Response Status',
  },
  notStarted: {
    id: 'course.surveys.ResponseIndex.notStarted',
    defaultMessage: 'Not Started',
  },
  submitted: {
    id: 'course.surveys.ResponseIndex.submitted',
    defaultMessage: 'Submitted',
  },
  responding: {
    id: 'course.surveys.ResponseIndex.responding',
    defaultMessage: 'Responding',
  },
  submittedAt: {
    id: 'course.surveys.ResponseIndex.submittedAt',
    defaultMessage: 'Submitted At',
  },
  phantoms: {
    id: 'course.surveys.ResponseIndex.phantoms',
    defaultMessage: 'Phantom Students',
  },
});

class ResponseIndex extends React.Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    surveys: PropTypes.arrayOf(surveyShape),
    responses: PropTypes.arrayOf(responseShape),
    isLoading: PropTypes.bool.isRequired,
    params: PropTypes.shape({
      courseId: PropTypes.string.isRequired,
      surveyId: PropTypes.string.isRequired,
    }).isRequired,
  };

  static renderReponseStatus(response, survey) {
    if (!response.present) {
      return <div style={styles.red}><FormattedMessage {...translations.notStarted} /></div>;
    }
    const status = response.submitted_at ? 'submitted' : 'responding';
    return (
      survey.anonymous ?
        <FormattedMessage {...translations[status]} /> :
        <Link to={response.path}>
          <FormattedMessage {...translations[status]} />
        </Link>
    );
  }

  static renderSubmittedAt(response, survey) {
    if (!response.submitted_at) {
      return null;
    }
    const submittedAt = moment(response.submitted_at).format('DD MMM YYYY, h:mma');
    if (survey.end_at && moment(response.submitted_at).isAfter(survey.end_at)) {
      return <div style={styles.red}>{ submittedAt }</div>;
    }
    return submittedAt;
  }

  static renderTable(responses, survey) {
    return (
      <Table>
        <TableHeader
          displaySelectAll={false}
          adjustForCheckbox={false}
        >
          <TableRow>
            <TableHeaderColumn colSpan={2}>
              <FormattedMessage {...translations.name} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.responseStatus} />
            </TableHeaderColumn>
            <TableHeaderColumn>
              <FormattedMessage {...translations.submittedAt} />
            </TableHeaderColumn>
            <TableHeaderColumn />
          </TableRow>
        </TableHeader>
        <TableBody
          displayRowCheckbox={false}
          showRowHover
        >
          {
            responses.map(response => (
              <TableRow key={response.course_user.id}>
                <TableRowColumn colSpan={2}>
                  <a href={response.course_user.path}>
                    { response.course_user.name }
                  </a>
                </TableRowColumn>
                <TableRowColumn>
                  { ResponseIndex.renderReponseStatus(response, survey) }
                </TableRowColumn>
                <TableRowColumn>
                  { ResponseIndex.renderSubmittedAt(response, survey) }
                </TableRowColumn>
                <TableRowColumn>
                  {
                    response.present && response.canUnsubmit ?
                      <UnsubmitButton responseId={response.id} /> : null
                  }
                </TableRowColumn>
              </TableRow>
            ))
          }
        </TableBody>
      </Table>
    );
  }

  static renderPhantomTable(responses, survey) {
    if (responses.length < 1) { return null; }

    return (
      <div>
        <h1><FormattedMessage {...translations.phantoms} /></h1>
        { ResponseIndex.renderTable(responses, survey) }
      </div>
    );
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchResponses());
  }

  renderHeader(survey) {
    const { params: { courseId, surveyId } } = this.props;
    return (
      <div>
        <TitleBar
          title={survey.title}
          iconElementLeft={<IconButton><ArrowBack /></IconButton>}
          onLeftIconButtonTouchTap={() => browserHistory.push(`/courses/${courseId}/surveys/${surveyId}`)}
        />
        <Card style={styles.detailsCard}>
          <Table style={styles.table}>
            <TableBody displayRowCheckbox={false}>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.opensAt} />
                </TableRowColumn>
                <TableRowColumn>
                  {formatDateTime(survey.start_at)}
                </TableRowColumn>
              </TableRow>
              <TableRow>
                <TableRowColumn>
                  <FormattedMessage {...surveyTranslations.expiresAt} />
                </TableRowColumn>
                <TableRowColumn>
                  {formatDateTime(survey.end_at)}
                </TableRowColumn>
              </TableRow>
            </TableBody>
          </Table>
        </Card>
      </div>
    );
  }

  renderBody(survey) {
    const { responses, isLoading } = this.props;
    if (isLoading) { return <LoadingIndicator />; }

    const { realResponses, phantomResponses } = responses.reduce(
      (categories, response) => {
        const cateogry = response.course_user.phantom ? 'phantomResponses' : 'realResponses';
        categories[cateogry].push(response);
        return categories;
      },
      { realResponses: [], phantomResponses: [] }
    );

    return (
      <div>
        { ResponseIndex.renderTable(realResponses, survey) }
        { ResponseIndex.renderPhantomTable(phantomResponses, survey) }
      </div>
    );
  }

  render() {
    const { surveys, params: { surveyId } } = this.props;
    const survey = surveys && surveys.length > 0 ?
                   surveys.find(s => String(s.id) === String(surveyId)) : {};
    return (
      <div>
        { this.renderHeader(survey) }
        { this.renderBody(survey) }
      </div>
    );
  }
}

export default connect(state => ({
  ...state.responses,
  surveys: state.surveys,
}))(ResponseIndex);
