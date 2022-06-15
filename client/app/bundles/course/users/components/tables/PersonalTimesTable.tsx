import {
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import { PersonalTimeEntity } from 'types/course/personalTimes';
import tableTranslations from 'lib/components/tables/translations';
import { getAssessmentURL, getVideoURL } from 'lib/helpers/url-builders';
import sharedConstants from 'lib/constants/sharedConstants';
import { getCourseId } from 'lib/helpers/url-helpers';
import Lock from '@mui/icons-material/Lock';
import PersonalTimeEditor from '../misc/PersonalTimeEditor';

interface Props extends WrappedComponentProps {
  personalTimes: PersonalTimeEntity[];
}

const translations = defineMessages({
  fixedDescription: {
    id: 'course.users.personalTimes.table.fixed.description',
    defaultMessage:
      "A fixed personal time means that the personal time will no longer be automatically modified. If a personal\
    time is left unfixed, it may be dynamically updated by the algorithm on the user's next submission.",
  },
});

const getLink = (item: PersonalTimeEntity): JSX.Element => {
  let url = '';
  const courseId = getCourseId();
  if (item.type === sharedConstants.ITEM_ACTABLE_TYPES.video.name) {
    url = getVideoURL(courseId, item.actableId);
  } else if (item.type === sharedConstants.ITEM_ACTABLE_TYPES.assessment.name) {
    url = getAssessmentURL(courseId, item.actableId);
  }

  return (
    <Link href={url} style={{ textDecoration: 'none' }}>
      {item.title}
    </Link>
  );
};

const PersonalTimesTable: FC<Props> = (props) => {
  const { personalTimes, intl } = props;

  const renderRow = (item: PersonalTimeEntity): JSX.Element => {
    return (
      <TableRow hover key={item.id}>
        <TableCell>{getLink(item)}</TableCell>
        <TableCell>{item.itemStartAt}</TableCell>
        <TableCell>{item.itemBonusEndAt}</TableCell>
        <TableCell>{item.itemEndAt}</TableCell>
        <PersonalTimeEditor item={item} />
      </TableRow>
    );
  };

  return (
    <>
      <Paper elevation={4} sx={{ overflowX: 'scroll', margin: '12px 0px' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell colSpan={3}>Reference Timeline</TableCell>
              <TableCell colSpan={4}>Personalized Timeline</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Item</TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.startAt)}
              </TableCell>
              <TableCell>Bonus Cut Off</TableCell>
              <TableCell>End At</TableCell>
              <TableCell align="center">
                <Tooltip
                  title={intl.formatMessage(translations.fixedDescription)}
                  placement="top"
                  arrow
                >
                  <Lock fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell>Start At</TableCell>
              <TableCell>Bonus Cut Off</TableCell>
              <TableCell>End At</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{personalTimes.map((item) => renderRow(item))}</TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default injectIntl(PersonalTimesTable);
