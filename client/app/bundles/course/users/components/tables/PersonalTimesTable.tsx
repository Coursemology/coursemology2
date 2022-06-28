import {
  Icon,
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
import { PersonalTimeMiniEntity } from 'types/course/personalTimes';
import tableTranslations from 'lib/components/tables/translations';
import { getAssessmentURL, getVideoURL } from 'lib/helpers/url-builders';
import sharedConstants from 'lib/constants/sharedConstants';
import { getCourseId } from 'lib/helpers/url-helpers';
import Lock from '@mui/icons-material/Lock';
import PersonalTimeEditor from '../misc/PersonalTimeEditor';

interface Props extends WrappedComponentProps {
  personalTimes: PersonalTimeMiniEntity[];
}

const translations = defineMessages({
  fixedDescription: {
    id: 'course.users.personalTimes.table.fixed.description',
    defaultMessage:
      "A fixed personal time means that the personal time will no longer be automatically modified. If a personal\
    time is left unfixed, it may be dynamically updated by the algorithm on the user's next submission.",
  },
});

const icons = {
  assessment: 'fa fa-plane',
  video: 'fa fa-video-camera',
};

const getLink = (item: PersonalTimeMiniEntity): JSX.Element => {
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

const getIcon = (item: PersonalTimeMiniEntity): JSX.Element => {
  let materialType = '';

  if (item.type === sharedConstants.ITEM_ACTABLE_TYPES.video.name) {
    materialType = 'video';
  } else if (item.type === sharedConstants.ITEM_ACTABLE_TYPES.assessment.name) {
    materialType = 'assessment';
  }

  return (
    <Icon
      className={icons[materialType]}
      style={{
        fontSize: 12,
        marginRight: '4px',
        verticalAlign: 'inherit',
      }}
    />
  );
};

const PersonalTimesTable: FC<Props> = (props) => {
  const { personalTimes, intl } = props;

  const renderRow = (item: PersonalTimeMiniEntity): JSX.Element => {
    return (
      <TableRow hover key={item.id}>
        <TableCell>
          {getIcon(item)}
          {getLink(item)}
        </TableCell>
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
              <TableCell colSpan={3}>
                {intl.formatMessage(tableTranslations.referenceTimeline)}
              </TableCell>
              <TableCell colSpan={4}>
                {intl.formatMessage(tableTranslations.personalizedTimeline)}e
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {intl.formatMessage(tableTranslations.item)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.startAt)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.bonusEndAt)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.endAt)}
              </TableCell>
              <TableCell align="center">
                <Tooltip
                  title={intl.formatMessage(translations.fixedDescription)}
                  placement="top"
                  arrow
                >
                  <Lock fontSize="small" />
                </Tooltip>
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.startAt)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.bonusEndAt)}
              </TableCell>
              <TableCell>
                {intl.formatMessage(tableTranslations.endAt)}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>{personalTimes.map((item) => renderRow(item))}</TableBody>
        </Table>
      </Paper>
    </>
  );
};

export default injectIntl(PersonalTimesTable);
