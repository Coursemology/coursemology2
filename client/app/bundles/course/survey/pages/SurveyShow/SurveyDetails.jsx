import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { defineMessages, FormattedMessage } from 'react-intl';
import { browserHistory } from 'react-router';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { formatDateTime } from 'lib/date-time-defaults';
import TitleBar from 'lib/components/TitleBar';
import surveyTranslations from '../../translations';
import { surveyShape } from '../../propTypes';
import { updateSurvey } from '../../actions/surveys';
import RespondButton from '../../containers/RespondButton';
import NewSectionButton from './NewSectionButton';

const translations = defineMessages({
  loading: {
    id: 'course.surveys.SurveyDetails.loading',
    defaultMessage: 'Loading Survey...',
  },
});

const styles = {
  table: {
    maxWidth: 600,
  },
  resultsButton: {
    marginRight: 15,
  },
};

class SurveyDetails extends React.Component {
  static propTypes = {
    survey: surveyShape,
    courseId: PropTypes.string.isRequired,
    adminFunctions: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      handler: PropTypes.func,
    })),

    dispatch: PropTypes.func.isRequired,
  };

  handlePublishToggle = (event, value) => {
    const { dispatch, survey } = this.props;
    dispatch(updateSurvey(
      survey.id,
      { survey: { published: value } },
      <FormattedMessage {...surveyTranslations.updateSuccess} values={survey} />,
      <FormattedMessage {...surveyTranslations.updateFailure} values={survey} />
    ));
  }

  renderAdminMenu() {
    const { adminFunctions } = this.props;

    if (!adminFunctions || adminFunctions.length < 1) {
      return null;
    }

    return (
      <IconMenu iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}>
        {
        adminFunctions.map(({ label, handler }) =>
          <MenuItem key={label} primaryText={label} onTouchTap={handler} />
        )
      }
      </IconMenu>
    );
  }

  renderDescription() {
    const { survey } = this.props;

    if (!survey.description) {
      return null;
    }

    return (
      <CardText>
        <h4>
          <FormattedMessage {...surveyTranslations.description} />
        </h4>
        <p>{survey.description}</p>
      </CardText>
    );
  }

  renderPublishToggle() {
    const { survey } = this.props;
    if (!survey.canUpdate) {
      return null;
    }

    return (
      <CardText>
        <Toggle
          label={<FormattedMessage {...surveyTranslations.published} />}
          labelPosition="right"
          toggled={survey.published}
          onToggle={this.handlePublishToggle}
        />
      </CardText>
    );
  }

  render() {
    const { survey, courseId } = this.props;
    if (!survey) {
      return <p><FormattedMessage {...translations.loading} /></p>;
    }

    return (
      <div>
        <TitleBar
          title={survey.title}
          iconElementRight={this.renderAdminMenu()}
          iconElementLeft={<IconButton><ArrowBack /></IconButton>}
          onLeftIconButtonTouchTap={() => browserHistory.push(`/courses/${courseId}/surveys`)}
        />
        <Card>
          <div>
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
                <TableRow>
                  <TableRowColumn>
                    <FormattedMessage {...surveyTranslations.points} />
                  </TableRowColumn>
                  <TableRowColumn>
                    {survey.base_exp}
                  </TableRowColumn>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          {this.renderPublishToggle()}
          {this.renderDescription()}
          <CardText>
            { survey.canCreateSection ? <NewSectionButton /> : null }
            {
              survey.canViewResults ?
                <RaisedButton
                  style={styles.resultsButton}
                  label={<FormattedMessage {...surveyTranslations.results} />}
                  onTouchTap={() => browserHistory.push(
                  `/courses/${courseId}/surveys/${survey.id}/results`
                )}
                /> : null
            }
            <RespondButton {...{ survey, courseId }} />
          </CardText>
        </Card>
      </div>
    );
  }
}

export default connect()(SurveyDetails);
