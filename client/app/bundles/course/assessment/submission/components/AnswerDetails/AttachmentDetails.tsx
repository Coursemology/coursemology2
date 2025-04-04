import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Chip, Typography } from '@mui/material';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

interface Props {
  attachments: {
    id: string;
    name: string;
  }[];
}

const translations = defineMessages({
  uploadedFiles: {
    id: 'course.assessment.submission.UploadedFileView.uploadedFiles',
    defaultMessage: 'Uploaded Files',
  },
  noFiles: {
    id: 'course.assessment.submission.UploadedFileView.noFiles',
    defaultMessage: 'No files uploaded.',
  },
});

const AttachmentDetails: FC<Props> = (props) => {
  const { attachments } = props;
  const { t } = useTranslation();

  const AttachmentComponent = (): JSX.Element => (
    <div className="mt-4">
      {attachments.map((attachment) => (
        <Chip
          key={attachment.id}
          clickable
          label={
            <Link href={`/attachments/${attachment.id}`}>
              {attachment.name}
            </Link>
          }
        />
      ))}
    </div>
  );

  return (
    <div className="mt-4">
      <Typography variant="h6">{t(translations.uploadedFiles)}</Typography>
      {attachments.length > 0 ? (
        <AttachmentComponent />
      ) : (
        <Typography color="text.secondary" variant="body2">
          {t(translations.noFiles)}
        </Typography>
      )}
    </div>
  );
};

export default AttachmentDetails;
