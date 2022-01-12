import React from 'react';
import PropTypes from 'prop-types';
import { courseUserShape } from '../propTypes';

const userTypeMapping = {
  student: 'Student',
  owner: 'Owner',
  manager: 'Manager',
  teaching_assistant: 'Teaching Assistant',
  observer: 'Observer',
};

const styles = {
  noWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    width: '300px',
  },
};

const UserTable = ({ courseUsers }) => {
  const renderUserGroups = (user) => (
    <div style={styles.noWrap}>
      {user.groups.map((group, index) => (
        <>
          <a>
            {group.categoryName} &gt; {group.groupName}
            {group.groupRole === 'manager' ? ' [M]' : ''}
          </a>
          {index === user.groups.length - 1 ? '' : <>,&nbsp;</>}
        </>
      ))}
    </div>
  );
  return (
    <table className="groups-table">
      <thead>
        <tr>
          <th className="auto-size">S/N</th>
          <th>Name</th>
          <th className="auto-size">User Type</th>
          <th className="auto-size">Groups</th>
          <th className="auto-size">&nbsp;</th>
        </tr>
      </thead>
      <tbody>
        {courseUsers.map((user, index) => (
          <tr key={courseUsers.id}>
            <td className="auto-size">{index + 1}</td>
            <td>{user.name}</td>
            <td className="auto-size">{userTypeMapping[user.role]}</td>
            <td className="auto-size">{renderUserGroups(user)}</td>
            <td className="auto-size">
              <button type="button" className="btn btn-secondary">
                Edit User Groups
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

UserTable.propTypes = {
  courseUsers: PropTypes.arrayOf(courseUserShape).isRequired,
};

export default UserTable;
