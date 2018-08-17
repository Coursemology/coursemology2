import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Field } from 'redux-form';
import { Card, CardHeader, CardText } from 'material-ui/Card';
import {
  Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn, TableFooter,
} from 'material-ui/Table';

import 'brace/mode/python';
import 'brace/theme/monokai';

import translations from '../OnlineEditorView.intl';
import PackageFileAdder from './PackageFileAdder';
import PackageFileRemover from './PackageFileRemover';
import styles from '../OnlineEditorView.scss';

const propTypes = {
  isLoading: PropTypes.bool.isRequired,
  intl: intlShape.isRequired,
};

const contextTypes = {
  muiTheme: PropTypes.object.isRequired,
};

class PackageFileManager extends React.Component {
  renderExistingPackageFiles() {
    const { intl, isLoading } = this.props;

    return (
      <Card initiallyExpanded>
        <CardHeader
          title={intl.formatMessage(translations.currentDataFilesHeader)}
          textStyle={{ fontWeight: 'bold' }}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <PackageFileRemover />
        </CardText>
      </Card>
    );
  }

  renderNewPackageFiles() {
    const { intl, isLoading } = this.props;

    return (
      <Card initiallyExpanded>
        <CardHeader
          title={intl.formatMessage(translations.newDataFilesHeader)}
          textStyle={{ fontWeight: 'bold' }}
          actAsExpander
          showExpandableButton
        />
        <CardText expandable style={{ padding: 0 }}>
          <Field
            name="question_programming[data_files]"
            component={PackageFileAdder}
          />
        </CardText>
      </Card>
    );
  }

  render() {
    const { intl } = this.props;

    return (
      <React.Fragment>
        <h3>{intl.formatMessage(translations.dataFilesHeader)}</h3>
        {this.renderExistingPackageFiles()}
        {this.renderNewPackageFiles()}
      </React.Fragment>
    );
  }
}

PackageFileManager.propTypes = propTypes;
PackageFileManager.contextTypes = contextTypes;

export default injectIntl(PackageFileManager);
