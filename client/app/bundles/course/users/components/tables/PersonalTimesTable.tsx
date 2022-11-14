import { FC } from 'react';
import { defineMessages, injectIntl, WrappedComponentProps } from 'react-intl';
import {
  Icon,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { PersonalTimeMiniEntity } from 'types/course/personalTimes';

import { ITEM_ACTABLE_TYPES } from 'lib/constants/sharedConstants';
import { getAssessmentURL, getVideoURL } from 'lib/helpers/url-builders';
import { getCourseId } from 'lib/helpers/url-helpers';
import tableTranslations from 'lib/translations/table';

import PersonalTimeEditor from '../misc/PersonalTimeEditor';

interface Props extends WrappedComponentProps {
  personalTimes: PersonalTimeMiniEntity[];
}

const translations = defineMessages({
  fixed: {
    id: 'course.users.personalTimes.table.fixed',
    defaultMessage: 'Fixed',
  },
});

const icons = {
  assessment: 'fa fa-plane',
  video: 'fa fa-video-camera',
};

const getLink = (item: PersonalTimeMiniEntity): JSX.Element => {
  let url = '';
  const courseId = getCourseId();
  if (item.type === ITEM_ACTABLE_TYPES.video.name) {
    url = getVideoURL(courseId, item.actableId);
  } else if (item.type === ITEM_ACTABLE_TYPES.assessment.name) {
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

  if (item.type === ITEM_ACTABLE_TYPES.video.name) {
    materialType = 'video';
  } else if (item.type === ITEM_ACTABLE_TYPES.assessment.name) {
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
      <TableRow key={item.id} hover>
        <TableCell>
          {getIcon(item)}
          {getLink(item)}
        </TableCell>
        <TableCell>{item.itemStartAt}</TableCell>
        <TableCell>{item.itemBonusEndAt}</TableCell>
        <TableCell>{item.itemEndAt}</TableCell>
        <PersonalTimeEditor
          key={`personal-time-editor-${item.id}`}
          item={item}
        />
      </TableRow>
    );
  };

  return (
    <Paper elevation={4} sx={{ overflowX: 'scroll', margin: '12px 0px' }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell colSpan={3}>
              {intl.formatMessage(tableTranslations.referenceTimeline)}
            </TableCell>
            <TableCell colSpan={4}>
              {intl.formatMessage(tableTranslations.personalizedTimeline)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>{intl.formatMessage(tableTranslations.item)}</TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.startAt)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.bonusEndAt)}
            </TableCell>
            <TableCell>{intl.formatMessage(tableTranslations.endAt)}</TableCell>
            <TableCell>{intl.formatMessage(translations.fixed)}</TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.startAt)}
            </TableCell>
            <TableCell>
              {intl.formatMessage(tableTranslations.bonusEndAt)}
            </TableCell>
            <TableCell>{intl.formatMessage(tableTranslations.endAt)}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>{personalTimes.map((item) => renderRow(item))}</TableBody>
      </Table>
    </Paper>
  );
};

export default injectIntl(PersonalTimesTable);
