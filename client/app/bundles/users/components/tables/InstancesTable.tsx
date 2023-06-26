import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
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
import tableTranslations from 'lib/translations/table';

interface Props extends WrappedComponentProps {
  title: string;
  instances: InstanceBasicMiniEntity[];
}

const InstancesTable: FC<Props> = ({ title, instances, intl }: Props) => {
  const { userId } = useParams();

  return (
    <Box style={{ marginBottom: '12px' }}>
      <Typography variant="h6">{title}</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              {intl.formatMessage(tableTranslations.instance)}
            </TableCell>
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

export default injectIntl(InstancesTable);
