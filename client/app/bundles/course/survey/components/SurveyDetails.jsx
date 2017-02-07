import React, { PropTypes } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { browserHistory } from 'react-router';
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui/Table';
import { Card, CardText } from 'material-ui/Card';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import ArrowBack from 'material-ui/svg-icons/navigation/arrow-back';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import { formatDateTime } from 'lib/date_time_defaults';
import TitleBar from 'lib/components/TitleBar';
import surveyTranslations from '../translations';

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
};

class SurveyDetails extends React.Component {
  renderAdminMenu() {
    const { adminFunctions } = this.props;

    if (!adminFunctions) {
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

  render() {
    const { intl, survey, courseId } = this.props;
    if (!survey) {
      return <p>{intl.formatMessage(translations.loading)}</p>;
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
                    {intl.formatMessage(surveyTranslations.opensAt)}
                  </TableRowColumn>
                  <TableRowColumn>
                    {formatDateTime(survey.start_at)}
                  </TableRowColumn>
                </TableRow>
                <TableRow>
                  <TableRowColumn>
                    {intl.formatMessage(surveyTranslations.expiresAt)}
                  </TableRowColumn>
                  <TableRowColumn>
                    {formatDateTime(survey.end_at)}
                  </TableRowColumn>
                </TableRow>
                <TableRow>
                  <TableRowColumn>
                    {intl.formatMessage(surveyTranslations.points)}
                  </TableRowColumn>
                  <TableRowColumn>
                    {survey.base_exp}
                  </TableRowColumn>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <CardText>
            <p>{survey.description}</p>
          </CardText>
        </Card>
      </div>
    );
  }
}

SurveyDetails.propTypes = {
  intl: intlShape.isRequired,
  survey: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    start_at: PropTypes.string,
    end_at: PropTypes.string,
    base_exp: React.PropTypes.number,
  }),
  adminFunctions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string,
    handler: PropTypes.func,
  })),
  courseId: PropTypes.string.isRequired,
};

export default injectIntl(SurveyDetails);
