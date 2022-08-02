import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import tableTranslations from 'lib/translations/table';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, AppState } from 'types/store';
import { getCourseUserId } from 'lib/helpers/url-helpers';
import { toast } from 'react-toastify';
import LoadingIndicator from 'lib/components/LoadingIndicator';
import { fetchExperiencePointsRecord } from '../../operations';
import { getAllExperiencePointsRecordsEntities } from '../../selectors';
import ExperiencePointsTableRow from './ExperiencePointsTableRow';

interface Props extends WrappedComponentProps {
  page: number;
}

const translations = defineMessages({
  fetchUsersFailure: {
    id: 'course.users.manage.fetch.failue',
    defaultMessage: 'Failed to fetch users',
  },
});

const ExperiencePointsTable: FC<Props> = (props) => {
  const { intl, page } = props;
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch<AppDispatch>();

  const experiencePointsRecords = useSelector((state: AppState) =>
    getAllExperiencePointsRecordsEntities(state),
  );

  useEffect(() => {
    dispatch(fetchExperiencePointsRecord(+getCourseUserId()!, page))
      .finally(() => {
        setIsLoading(false);
      })
      .catch(() =>
        toast.error(intl.formatMessage(translations.fetchUsersFailure)),
      );
  }, [page]);

  if (isLoading) {
    return <LoadingIndicator />;
  }

  return (
    <>
      <Paper elevation={4} sx={{ margin: '12px 0px' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {intl.formatMessage(tableTranslations.updater)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.reason)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.experiencePointsAwarded)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.updatedAt)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.actions)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {experiencePointsRecords.map((item) => (
              <ExperiencePointsTableRow
                id={item.id}
                record={item}
                key={item.id}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default injectIntl(ExperiencePointsTable);
