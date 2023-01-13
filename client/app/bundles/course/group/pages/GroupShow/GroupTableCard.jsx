import { defineMessages, FormattedMessage } from 'react-intl';
import FaceRetouchingOffIcon from '@mui/icons-material/FaceRetouchingOff';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { grey } from '@mui/material/colors';

import GroupCard from '../../components/GroupCard';
import { groupShape } from '../../propTypes';
import { sortByGroupRole, sortByName, sortByPhantom } from '../../utils/sort';

const translations = defineMessages({
  subtitle: {
    id: 'course.group.GroupShow.GroupTableCard.subtitle',
    defaultMessage:
      '{numMembers} {numMembers, plural, one {member} other {members}}',
  },
  serialNumber: {
    id: 'course.group.GroupShow.GroupTableCard.serialNumber',
    defaultMessage: 'S/N',
  },
  name: {
    id: 'course.group.GroupShow.GroupTableCard.name',
    defaultMessage: 'Name',
  },
  role: {
    id: 'course.group.GroupShow.GroupTableCard.role',
    defaultMessage: 'Role',
  },
  noMembers: {
    id: 'course.group.GroupShow.GroupTableCard.noMembers',
    defaultMessage:
      'This group has no members! Manage groups to assign members now!',
  },
});

const roles = {
  normal: 'Member',
  manager: 'Manager',
};

const styles = {
  empty: {
    paddingTop: '2rem',
    textAlign: 'center',
    color: grey[700],
  },
  rowHeight: {
    height: 36,
  },
};

const GroupTableCard = ({ group }) => {
  const members = [...group.members];
  members.sort(sortByName).sort(sortByPhantom).sort(sortByGroupRole);

  return (
    <GroupCard
      subtitle={
        <FormattedMessage
          values={{ numMembers: members.length ?? 0 }}
          {...translations.subtitle}
        />
      }
      title={group.name}
    >
      <Table>
        <TableHead>
          <TableRow style={styles.rowHeight}>
            <TableCell style={styles.rowHeight}>
              <FormattedMessage {...translations.serialNumber} />
            </TableCell>
            <TableCell style={styles.rowHeight}>
              <FormattedMessage {...translations.name} />
            </TableCell>
            <TableCell style={styles.rowHeight}>
              <FormattedMessage {...translations.role} />
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {members.map((m, index) => (
            <TableRow key={m.id} style={styles.rowHeight}>
              <TableCell style={styles.rowHeight}>{index + 1}</TableCell>
              <TableCell style={styles.rowHeight}>
                <div className='flex grow'>
                  {m.isPhantom? <FaceRetouchingOffIcon style={{ size: "15px", padding: 2 }}/> : ""}
                  {m.groupRole === "manager" ? <b>{m.name}</b> : m.name}
                </div>
              </TableCell>
              <TableCell style={styles.rowHeight}>
                {roles[m.groupRole]}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {members.length === 0 ? (
        <div style={styles.empty}>
          <FormattedMessage {...translations.noMembers} />
        </div>
      ) : null}
    </GroupCard>
  );
};

GroupTableCard.propTypes = {
  group: groupShape.isRequired,
};

export default GroupTableCard;
