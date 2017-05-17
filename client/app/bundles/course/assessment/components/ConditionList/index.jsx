import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table';
import Subheader from 'material-ui/Subheader';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import NewIcon from 'material-ui/svg-icons/content/add';
import EditIcon from 'material-ui/svg-icons/editor/mode-edit';
import DeleteIcon from 'material-ui/svg-icons/action/delete';
import translations from './translations.intl';

const styles = {
  alignRight: {
    textAlign: 'right',
  },
};

class ConditionList extends React.Component {
  static propTypes = {
    intl: intlShape,
    newConditionUrls: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        url: PropTypes.string,
      })
    ).isRequired,
    conditions: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        description: PropTypes.string,
        edit_url: PropTypes.string,
        delete_url: PropTypes.string,
      })
    ),
  }

  static defaultProps = {
    conditions: [],
  }

  renderTopHeader() {
    return (
      <TableRow>
        <TableHeaderColumn colSpan="4">
          <h3><FormattedMessage {...translations.title} /></h3>
        </TableHeaderColumn>
        <TableHeaderColumn colSpan="2" style={styles.alignRight}>
          <IconMenu
            iconButtonElement={<IconButton><NewIcon /></IconButton>}
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
          >
            {
            this.props.newConditionUrls.map(url => (
              <MenuItem
                key={url.name}
                primaryText={url.name}
                href={url.url}
              />
            ))
          }
          </IconMenu>
        </TableHeaderColumn>
      </TableRow>
    );
  }

  renderHeaderRows() {
    if (this.props.conditions.length > 0) {
      return (
        <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
          {this.renderTopHeader()}
          <TableRow>
            <TableHeaderColumn colSpan="1">
              <FormattedMessage {...translations.type} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan="3">
              <FormattedMessage {...translations.description} />
            </TableHeaderColumn>
            <TableHeaderColumn colSpan="2" />
          </TableRow>
        </TableHeader>
      );
    }
    return (
      <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
        {this.renderTopHeader()}
      </TableHeader>
    );
  }

  renderConditionRows() {
    return (
      this.props.conditions.map(condition =>
        (<TableRow key={condition.edit_url}>
          <TableRowColumn colSpan="1">{condition.type}</TableRowColumn>
          <TableRowColumn colSpan="3">{condition.description}</TableRowColumn>
          <TableRowColumn colSpan="2" style={styles.alignRight}>
            <IconButton href={condition.edit_url}>
              <EditIcon />
            </IconButton>

            <IconButton
              href={condition.delete_url}
              data-method="delete"
              data-confirm={this.props.intl.formatMessage(translations.deleteConfirm)}
            >
              <DeleteIcon />
            </IconButton>
          </TableRowColumn>
        </TableRow>)
      )
    );
  }

  render() {
    return (
      <div>
        <Table selectable={false} >
          {this.renderHeaderRows()}
          <TableBody displayRowCheckbox={false}>
            {this.renderConditionRows()}
          </TableBody>
        </Table>
        {
          this.props.conditions.length === 0 &&
          <Subheader><FormattedMessage {...translations.empty} /></Subheader>
        }
      </div>
    );
  }
}

export default injectIntl(ConditionList);
