import { TableBody, TableCell, TableRow } from '@mui/material';
import { VideoData } from 'types/course/videos';

import TableContainer from 'lib/components/core/layouts/TableContainer';
import PersonalStartEndTime from 'lib/components/extensions/PersonalStartEndTime';
import useTranslation from 'lib/hooks/useTranslation';
import tableTranslations from 'lib/translations/table';

interface Props {
  for: VideoData;
}

const VideoDetails = (props: Props): JSX.Element => {
  const { for: video } = props;
  const { t } = useTranslation();

  return (
    <TableContainer dense variant="outlined">
      <TableBody>
        {video.startTimeInfo.referenceTime && (
          <TableRow>
            <TableCell variant="head">{t(tableTranslations.startAt)}</TableCell>
            <TableCell>
              <PersonalStartEndTime long timeInfo={video.startTimeInfo} />
            </TableCell>
          </TableRow>
        )}

        {video.hasTodo && (
          <TableRow>
            <TableCell variant="head">{t(tableTranslations.hasTodo)}</TableCell>
            <TableCell>{video.hasTodo ? '✅' : '❌'}</TableCell>
          </TableRow>
        )}

        {video.hasPersonalTimes && (
          <TableRow>
            <TableCell variant="head">
              {t(tableTranslations.hasPersonalTimes)}
            </TableCell>
            <TableCell>{video.hasPersonalTimes ? '✅' : '❌'}</TableCell>
          </TableRow>
        )}
      </TableBody>
    </TableContainer>
  );
};

export default VideoDetails;
