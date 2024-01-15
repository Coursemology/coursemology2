import { FC } from 'react';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';
import { downloadFile } from 'utilities/downloadFile';

import Link from 'lib/components/core/Link';
import useTranslation from 'lib/hooks/useTranslation';

interface ProgrammingFileDownloadLinkProps {
  file: ProgrammingContent;
}

const ProgrammingFileDownloadLink: FC<ProgrammingFileDownloadLinkProps> = (
  props,
) => {
  const { t } = useTranslation();
  return (
    <Link
      className="inline"
      onClick={(): void =>
        downloadFile('text/plain', props.file.content, props.file.filename)
      }
      underline="hover"
    >
      {t({
        id: 'course.assessment.submission.answers.Programming.ProgrammingFileDownloadLink.downloadFile',
        defaultMessage: 'Download file',
      })}
    </Link>
  );
};

export default ProgrammingFileDownloadLink;
