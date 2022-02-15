import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import {
  IconButton,
  ListSubheader,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import Add from '@material-ui/icons/Add';
import Edit from '@material-ui/icons/Edit';
import Delete from '@material-ui/icons/Delete';
import translations from './translations.intl';

const styles = {
  alignRight: {
    textAlign: 'right',
  },
};

class ConditionList extends React.Component {
  renderTopHeader() {
    return (
      <TableRow>
        <TableCell colSpan="4">
          <h3>
            <FormattedMessage {...translations.title} />
          </h3>
        </TableCell>
        <TableCell colSpan="2" style={styles.alignRight}>
          <IconMenu
            iconButtonElement={
              <IconButton>
                <Add />
              </IconButton>
            }
            anchorOrigin={{ horizontal: 'right', vertical: 'top' }}
            targetOrigin={{ horizontal: 'right', vertical: 'top' }}
            className="add-condition-btn"
          >
            {this.props.newConditionUrls.map((url) => (
              <MenuItem key={url.name} primaryText={url.name} href={url.url} />
            ))}
          </IconMenu>
        </TableCell>
      </TableRow>
    );
  }

  renderHeaderRows() {
    if (this.props.conditions.length > 0) {
      return (
        <TableHead>
          {this.renderTopHeader()}
          <TableRow>
            <TableCell colSpan="1">
              <FormattedMessage {...translations.type} />
            </TableCell>
            <TableCell colSpan="3">
              <FormattedMessage {...translations.description} />
            </TableCell>
            <TableCell colSpan="2" />
          </TableRow>
        </TableHead>
      );
    }
    return <TableHead>{this.renderTopHeader()}</TableHead>;
  }

  renderConditionRows() {
    return this.props.conditions.map((condition) => (
      <TableRow key={condition.edit_url}>
        <TableCell colSpan="1">{condition.type}</TableCell>
        <TableCell colSpan="3">{condition.description}</TableCell>
        <TableCell colSpan="2" style={styles.alignRight}>
          <IconButton href={condition.edit_url}>
            <Edit nativeColor="black" />
          </IconButton>

          <IconButton
            href={condition.delete_url}
            data-method="delete"
            data-confirm={this.props.intl.formatMessage(
              translations.deleteConfirm,
            )}
          >
            <Delete nativeColor="black" />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  }

  render() {
    return (
      <div>
        <Table>
          {this.renderHeaderRows()}
          <TableBody className="conditions-list">
            {this.renderConditionRows()}
          </TableBody>
        </Table>
        {this.props.conditions.length === 0 && (
          <ListSubheader>
            <FormattedMessage {...translations.empty} />
          </ListSubheader>
        )}
      </div>
    );
  }
}

ConditionList.propTypes = {
  intl: intlShape,
  newConditionUrls: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  conditions: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      description: PropTypes.string,
      edit_url: PropTypes.string,
      delete_url: PropTypes.string,
    }),
  ),
};

ConditionList.defaultProps = {
  conditions: [],
};

export default injectIntl(ConditionList);
