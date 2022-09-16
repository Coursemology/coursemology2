import { FC } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import tableTranslations from 'lib/translations/table';
import { useParams } from 'react-router-dom';
import { InstanceBasicMiniEntity } from 'types/system/instances';

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
                <Typography variant="body2" className="instance_title">
                  <a
                    href={`//${instance.host}/users/${userId}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {instance.name}
                  </a>
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
