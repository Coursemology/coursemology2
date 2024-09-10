import Draggable from 'react-draggable';
import { useParams } from 'react-router-dom';
import { Close } from '@mui/icons-material';
import { IconButton, Popover, Typography } from '@mui/material';
import { HeartbeatDetail } from 'types/channels/liveMonitoring';

import { BrowserAuthorizationMethod } from 'course/assessment/components/monitoring/BrowserAuthorizationMethodOptionsFormFields/common';
import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';
import { formatPreciseDateTime } from 'lib/moment';

import translations from '../../../translations';

import HeartbeatsTimeline from './HeartbeatsTimeline';

interface SessionDetailsPopupProps {
  for: string;
  showing: HeartbeatDetail[];
  open: boolean;
  onClose: () => void;
  generatedAt?: string;
  anchorsOn?: HTMLElement;
  validates?: boolean;
  browserAuthorizationMethod?: BrowserAuthorizationMethod;
  onClickShowAllHeartbeats?: () => void;
  submissionId?: number;
}

const SessionDetailsPopup = (props: SessionDetailsPopupProps): JSX.Element => {
  const {
    anchorsOn: anchorElement,
    for: name,
    showing: heartbeats,
    generatedAt: time,
  } = props;

  const { t } = useTranslation();

  const { courseId, assessmentId } = useParams();

  return (
    <Draggable handle=".handle">
      <Popover
        anchorEl={anchorElement}
        classes={{
          paper:
            'flex flex-col px-4 pb-4 @container w-[36rem] shadow-xl border border-solid border-neutral-200 space-y-4 resize',
        }}
        elevation={0}
        onClose={props.onClose}
        open={props.open}
        transformOrigin={{ vertical: 'center', horizontal: 'center' }}
      >
        <header className="handle sticky top-0 -mx-4 mb-4 cursor-move border-only-b-neutral-200 bg-white p-4">
          <IconButton
            className="float-right ml-5"
            edge="end"
            onClick={props.onClose}
            size="small"
          >
            <Close />
          </IconButton>

          <Typography>{name}</Typography>

          <Typography color="text.secondary" variant="caption">
            {t(translations.summaryCorrectAsAt, {
              time: formatPreciseDateTime(time),
            })}
          </Typography>
        </header>

        {props.submissionId && (
          <Link
            className="px-2 !mt-0 !mb-4"
            opensInNewTab
            to={`/courses/${courseId}/assessments/${assessmentId}/submissions/${props.submissionId}/edit`}
          >
            {t(translations.openSubmissionInNewTab)}
          </Link>
        )}

        <div className="flex justify-between items-center px-2">
          <Typography color="text.secondary" variant="body2">
            {t(translations.detailsOfNHeartbeats, {
              n: heartbeats.length,
            })}
          </Typography>

          <Link onClick={props.onClickShowAllHeartbeats}>
            {t(translations.loadAllHeartbeats)}
          </Link>
        </div>

        <HeartbeatsTimeline
          browserAuthorizationMethod={props.browserAuthorizationMethod}
          in={heartbeats}
          validates={props.validates}
        />
      </Popover>
    </Draggable>
  );
};

export default SessionDetailsPopup;
