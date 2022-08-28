import { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, FormattedMessage } from 'react-intl';
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
  Grid,
  Button,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Edit from '@mui/icons-material/Edit';
import Delete from '@mui/icons-material/Delete';
import ConfirmationDialog from 'lib/components/ConfirmationDialog';
import translations from './translations.intl';

const styles = {
  alignRight: {
    textAlign: 'right',
  },
  alignMiddle: {
    verticalAlign: 'middle',
  },
};

class ConditionList extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      anchorEl: null,
      deletionUrl: '',
      isDeleting: false,
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

  onConfirmDelete() {
    // TODO: Refactor the below into a ConditionAPI
    const form = $('<form>', {
      method: 'POST',
      action: this.state.deletionUrl,
    });

    const token = $('<input>', {
      type: 'hidden',
      name: 'authenticity_token',
      value: $.rails.csrfToken(),
    });

    const method = $('<input>', {
      name: '_method',
      type: 'hidden',
      value: 'DELETE',
    });

    // This will refresh the page
    form.append(token, method).appendTo(document.body).submit();
  }

  renderConditionRows() {
    return this.props.conditions.map((condition) => (
      <TableRow key={condition.edit_url || condition.id}>
        <TableCell colSpan="1">{condition.type}</TableCell>
        <TableCell colSpan="3">
          {condition.description || condition.title}
        </TableCell>
        <TableCell colSpan="2" style={styles.alignRight}>
          <IconButton href={condition.edit_url || condition.editUrl}>
            <Edit htmlColor="black" style={{ padding: 0 }} />
          </IconButton>

          <IconButton
            onClick={() =>
              this.setState({
                isDeleting: true,
                deletionUrl: condition.delete_url || condition.deleteUrl,
              })
            }
            style={styles.alignMiddle}
            id={condition.delete_url || condition.deleteUrl}
          >
            <Delete htmlColor="black" style={{ padding: 0 }} />
          </IconButton>
        </TableCell>
      </TableRow>
    ));
  }

  renderHeaderRows() {
    if (this.props.conditions.length > 0) {
      return (
        <TableHead>
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

    return null;
  }

  renderTopHeader() {
    return (
      <>
        <Button
          startIcon={<Add />}
          variant="outlined"
          size="small"
          onClick={this.handleClick}
        >
          <FormattedMessage {...translations.addCondition} />
        </Button>

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
      </>
    );
  }

  render() {
    return (
      <>
        {this.renderTopHeader()}

        <Table>
          {this.renderHeaderRows()}
          <TableBody className="conditions-list">
            {this.renderConditionRows()}
          </TableBody>
        </Table>

        <ConfirmationDialog
          confirmDelete
          open={this.state.isDeleting}
          message={this.props.intl.formatMessage(translations.deleteConfirm)}
          onCancel={() => this.setState({ isDeleting: false })}
          onConfirm={() => this.onConfirmDelete()}
        />
      </>
    );
  }
}

ConditionList.propTypes = {
  intl: PropTypes.object,
  newConditionUrls: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      url: PropTypes.string,
    }),
  ).isRequired,
  conditions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      description: PropTypes.string,
      title: PropTypes.string,
      edit_url: PropTypes.string,
      delete_url: PropTypes.string,
    }),
  ),
};

ConditionList.defaultProps = {
  conditions: [],
};

export default injectIntl(ConditionList);
