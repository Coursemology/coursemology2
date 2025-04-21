import { FC } from 'react';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Warning } from '@mui/icons-material';
import { Paper, Typography } from '@mui/material';
import { ProgrammingContent } from 'types/course/assessment/submission/answer/programming';
import { Annotation, AnnotationTopic } from 'types/course/statistics/answer';

import ProgrammingFileDownloadChip from 'course/assessment/submission/components/answers/Programming/ProgrammingFileDownloadChip';
import ReadOnlyEditor from 'course/assessment/submission/components/ReadOnlyEditor';

const translations = defineMessages({
  sizeTooBig: {
    id: 'course.assessment.submission.answers.Programming.ProgrammingFile.sizeTooBig',
    defaultMessage: 'The file is too big and cannot be displayed.',
  },
});

interface Props {
  answerId: number;
  annotations: Annotation[];
  file: ProgrammingContent;
}

const FileContent: FC<Props> = (props) => {
  const { answerId, annotations, file } = props;
  const fileAnnotation = annotations.find((a) => a.fileId === file.id);

  return file.highlightedContent !== null ? (
    <ReadOnlyEditor
      annotations={fileAnnotation?.topics ?? ([] as AnnotationTopic[])}
      answerId={answerId}
      file={file}
      isUpdatingAnnotationAllowed={false}
    />
  ) : (
    <>
      <ProgrammingFileDownloadChip file={file} />
      <Paper className="flex items-center bg-yellow-100 p-2">
        <Warning />
        <Typography variant="body2">
          <FormattedMessage {...translations.sizeTooBig} />
        </Typography>
      </Paper>
    </>
  );
};

export default FileContent;
