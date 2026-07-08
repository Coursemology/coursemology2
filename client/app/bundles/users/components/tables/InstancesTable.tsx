import { FC } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { InstanceBasicMiniEntity } from 'types/system/instances';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';
import instanceRoleTranslations from 'lib/translations/instance/users/roles';
import tableTranslations from 'lib/translations/table';

interface Props {
  title: string;
  instances: InstanceBasicMiniEntity[];
}

const InstancesTable: FC<Props> = ({ title, instances }: Props) => {
  const { t } = useTranslation();
  const { userId } = useParams();

  return (
    <Box style={{ marginBottom: '12px' }}>
      <Typography variant="h6">{title}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{t(tableTranslations.instance)}</TableCell>
            <TableCell>{t(tableTranslations.role)}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {instances.map((instance) => (
            <TableRow key={`instance-${instance.id}`} hover>
              <TableCell>
                <Typography className="instance_title" variant="body2">
                  <Link
                    href={`//${instance.host}/users/${userId}`}
                    opensInNewTab
                  >
                    {instance.name}
                  </Link>
                </Typography>
              </TableCell>
              <TableCell>
                <Typography className="instance_role" variant="body2">
                  {instance.instanceRole
                    ? t(instanceRoleTranslations[instance.instanceRole])
                    : '-'}
                </Typography>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default InstancesTable;
