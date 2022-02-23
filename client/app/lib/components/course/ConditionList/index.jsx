import React from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape, FormattedMessage } from 'react-intl';
import {
  IconButton,
  ListSubheader,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@material-ui/core';
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
  constructor(props) {
    super(props);

    this.state = {
      anchorEl: null,
    };
  }

  handleClick = (event) => {
    // This prevents ghost click.
    event.preventDefault();

    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  renderTopHeader() {
    return (
      <TableRow>
        <TableCell colSpan="4">
          <h3>
            <FormattedMessage {...translations.title} />
          </h3>
        </TableCell>
        <TableCell colSpan="2" style={styles.alignRight}>
          <IconButton className="add-condition-btn" onClick={this.handleClick}>
            <Add />
          </IconButton>
          <Menu
            id="condition-menu"
            anchorEl={this.state.anchorEl}
            disableAutoFocusItem
            onClose={this.handleClose}
            open={Boolean(this.state.anchorEl)}
          >
            {this.props.newConditionUrls.map((url) => (
              <MenuItem component="a" key={url.name} href={url.url}>
                {url.name}
              </MenuItem>
            ))}
          </Menu>
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
            <Edit htmlColor="black" />
          </IconButton>

          <IconButton
            href={condition.delete_url}
            data-confirm={this.props.intl.formatMessage(
              translations.deleteConfirm,
            )}
            data-method="delete"
          >
            <Delete htmlColor="black" />
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
          <ListSubheader disableSticky>
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
