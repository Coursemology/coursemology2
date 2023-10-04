import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';

import { fetchUserExperiencePointsRecord } from 'course/experience-points/operations';
import { getAllExpPointsRecordsEntities } from 'course/experience-points/selectors';
import TableContainer from 'lib/components/core/layouts/TableContainer';
import LoadingIndicator from 'lib/components/core/LoadingIndicator';
import { getCourseUserId } from 'lib/helpers/url-helpers';
import { useAppDispatch, useAppSelector } from 'lib/hooks/store';
import toast from 'lib/hooks/toast';
import tableTranslations from 'lib/translations/table';

import ExperiencePointsTableRow from './ExperiencePointsTableRow';

interface Props extends WrappedComponentProps {
  page: number;
}

const translations = defineMessages({
  fetchRecordsFailure: {
    id: 'course.users.ExperiencePointsTable.fetchRecordsFailure',
    defaultMessage: 'Failed to fetch records',
  },
});

const ExperiencePointsTable: FC<Props> = (props) => {
  const { intl, page } = props;
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useAppDispatch();

  const records = useAppSelector(getAllExpPointsRecordsEntities);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchUserExperiencePointsRecord(+getCourseUserId()!, page))
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchRecordsFailure)),
      )
      .finally(() => {
        setIsLoading(false);
      });
  }, [page]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <TableContainer dense variant="bare">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              {intl.formatMessage(tableTranslations.updatedAt)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.updater)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.reason)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.experiencePointsAwarded)}
            </TableCell>
            <TableCell />
          </TableRow>
        </TableHead>
        {isLoading ? (
          <LoadingIndicator />
        ) : (
          <TableBody>
            {records.map((item) => (
              <ExperiencePointsTableRow
                key={item.id}
                id={item.id}
                record={item}
              />
            ))}
          </TableBody>
        )}
      </Table>
    </TableContainer>
  );
};

export default injectIntl(ExperiencePointsTable);
