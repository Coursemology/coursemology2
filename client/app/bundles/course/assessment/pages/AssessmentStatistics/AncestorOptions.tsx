import { FC, Fragment } from 'react';
import { defineMessages } from 'react-intl';
import { ArrowForward } from '@mui/icons-material';
import { Card, CardContent, Chip, Typography } from '@mui/material';

import { AncestorShape } from 'course/assessment/types';
import useTranslation from 'lib/hooks/useTranslation';

const translations = defineMessages({
  title: {
    id: 'course.assessment.statistics.ancestorSelect.title',
    defaultMessage: 'Duplication History',
  },
  subtitle: {
    id: 'course.assessment.statistics.ancestorSelect.subtitle',
    defaultMessage: 'Compare against past versions of this assessment:',
  },
  current: {
    id: 'course.assessment.statistics.ancestorSelect.current',
    defaultMessage: 'Current',
  },
  fromCourse: {
    id: 'course.assessment.statistics.ancestorSelect.fromCourse',
    defaultMessage: 'From {courseTitle}',
  },
});

interface Props {
  assessmentId: number;
  ancestors: AncestorShape[];
  selectedAncestorId: number;
  fetchAncestorSubmissions: (id: number) => void;
}

const AncestorOptions: FC<Props> = (props) => {
  const { t } = useTranslation();
  const {
    assessmentId,
    ancestors,
    selectedAncestorId,
    fetchAncestorSubmissions,
  } = props;

  return (
    <div className="mt-8 w-full overflow-x-scroll h-[20rem] px-2 py-2 bg-gray-100 my-4 flex items-center">
      {ancestors.map((ancestor, index) => (
        <Fragment key={ancestor.id}>
          <Card
            className={
              ancestor.id === selectedAncestorId
                ? 'h-[17rem] w-[35rem] min-w-[30rem] mx-4 bg-green-100 cursor-pointer'
                : 'h-[17rem] w-[35rem] min-w-[30rem] mx-4 cursor-pointer'
            }
            onClick={() => fetchAncestorSubmissions(ancestor.id)}
          >
            <CardContent>
              <Typography className="mb-2 text-[1.7rem] font-bold">
                {ancestor.title}
              </Typography>
              <Typography className="mb-2 text-[1.3rem]">
                {t(translations.fromCourse, {
                  courseTitle: ancestor.courseTitle,
                })}
              </Typography>
              {ancestor.id === assessmentId ? (
                <Chip label={t(translations.current)} />
              ) : null}
            </CardContent>
          </Card>
          {index !== ancestors.length - 1 && <ArrowForward />}
        </Fragment>
      ))}
    </div>
  );
};

export default AncestorOptions;
