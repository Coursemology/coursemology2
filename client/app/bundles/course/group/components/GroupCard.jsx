import { Card, CardHeader, CardText, FlatButton } from 'material-ui';
import React from 'react';
import PropTypes from 'prop-types';

import { green100 } from 'material-ui/styles/colors';
import BootstrapDropdown from './BootstrapDropdown';
import { courseUserShape, groupShape } from '../propTypes';

const styles = {
  addMemberButton: {
    marginTop: '5px',
    opacity: '0.7',
  },
  card: {
    boxShadow: 'none',
    marginTop: '0.75rem',
  },
  header: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 0',
  },
  headerText: {
    fontWeight: 'bold',
    color: '#333333',
    fontSize: '1.1em',
  },
  roleDropdown: {
    width: '150px',
  },
  nameDropdown: {
    width: '100%',
  },
};

const groupRoles = [
  {
    value: 'normal',
    label: 'Normal',
  },
  {
    value: 'manager',
    label: 'Manager',
  },
];

class GroupCard extends React.Component {
  static renderTableHeader() {
    return (
      <thead>
        <tr>
          <th className="auto-size">S/N</th>
          <th>Name</th>
          <th className="auto-size">Role</th>
          <th className="auto-size">&nbsp;</th>
        </tr>
      </thead>
    );
  }

  constructor(props) {
    super(props);
    this.state = {
      isExpanded: true,
      isAddingMember: false,
      selectedUserId: null,
      selectedRole: null,
    };
  }

  handleIsExpandedChange = (isExpanded) => {
    this.setState({ isExpanded });
  };

  handleClickAddMember = () => {
    this.setState({ isAddingMember: true });
  };

  renderCardHeader = (group) => (
    <div style={styles.header}>
      <div style={styles.headerText}>
        {group.name} ({group.members.length} Groups)
      </div>
      <button type="button" className="btn btn-secondary">
        Edit Group
      </button>
    </div>
  );

  renderTableRow = (member, index) => (
    <tr>
      <td className="auto-size">{index + 1}</td>
      <td>{member.name}</td>
      <td className="auto-size">
        <BootstrapDropdown
          selectedValue={member.groupRole}
          options={groupRoles}
          dropdownId={`role-${member.id}`}
          style={styles.roleDropdown}
        />
      </td>
      <td className="auto-size">
        <button type="button" className="btn btn-danger">
          Delete
        </button>
      </td>
    </tr>
  );

  renderAddMemberRow = (index) => {
    if (!this.state.isAddingMember) {
      return null;
    }

    const { courseUsers } = this.props;

    return (
      <tr>
        <td className="auto-size">{index + 1}</td>
        <td>
          <BootstrapDropdown
            selectedValue={this.state.selectedUserId}
            options={courseUsers.map((u) => ({ value: u.id, label: u.name }))}
            dropdownId="add-new-member-name"
            style={styles.nameDropdown}
            onChange={(userId) => this.setState({ selectedUserId: userId })}
          />
        </td>
        <td className="auto-size">
          <BootstrapDropdown
            selectedValue={this.state.selectedRole}
            options={groupRoles}
            dropdownId="add-new-member-role"
            style={styles.roleDropdown}
            onChange={(role) => this.setState({ selectedRole: role })}
          />
        </td>
        <td className="auto-size">
          <button
            type="button"
            className="btn btn-danger"
            onClick={() => {
              this.setState({
                isAddingMember: false,
                selectedUserId: null,
                selectedRole: null,
              });
            }}
          >
            Cancel
          </button>
        </td>
      </tr>
    );
  };

  render() {
    const { group } = this.props;
    // TODO: Add validations e.g. uniqueness etc.
    const isAddButtonDisabled =
      this.state.isAddingMember &&
      (this.state.selectedRole == null || this.state.selectedUserId == null);

    return (
      <Card
        onExpandChange={this.handleIsExpandedChange}
        expanded={this.state.isExpanded}
        style={styles.card}
      >
        <CardHeader
          title={this.renderCardHeader(group)}
          actAsExpander
          showExpandableButton
          className="group-card-header"
        />
        <CardText expandable className="group-card-body">
          <table className="groups-table">
            {GroupCard.renderTableHeader()}
            <tbody>
              {group.members.map((member, index) =>
                this.renderTableRow(member, index),
              )}
              {this.renderAddMemberRow(group.members.length)}
            </tbody>
          </table>
          <FlatButton
            onClick={this.handleClickAddMember}
            fullWidth
            style={{
              ...styles.addMemberButton,
              ...(this.state.isAddingMember && !isAddButtonDisabled
                ? { backgroundColor: green100 }
                : {}),
            }}
            disabled={isAddButtonDisabled}
          >
            {this.state.isAddingMember ? 'Confirm Add' : '+ Add Member'}
          </FlatButton>
        </CardText>
      </Card>
    );
  }
}

GroupCard.propTypes = {
  group: groupShape.isRequired,
  courseUsers: PropTypes.arrayOf(courseUserShape).isRequired,
};

export default GroupCard;
