import { Fragment } from 'react';
import { injectIntl } from 'react-intl';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Card, CardContent, Chip, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { ancestorShape } from '../../propTypes';

const translations = {
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
};

const AncestorOptions = ({
  assessmentId,
  ancestors,
  selectedAncestorId,
  setSelectedAncestorId,
  intl,
}) => (
  <div className="mt-8">
    <Typography component="div" fontWeight="bold" gutterBottom variant="h6">
      {intl.formatMessage(translations.title)}
    </Typography>
    <Typography
      component="div"
      fontSize="1.5rem"
      marginBottom="1rem"
      variant="subtitle1"
    >
      {intl.formatMessage(translations.subtitle)}
    </Typography>
    <div className="w-full overflow-x-scroll h-[20rem] px-4 py-4 bg-gray-100 my-4 flex items-center">
      {ancestors.map((ancestor, index) => (
        <Fragment key={ancestor.id}>
          <Card
            className={
              ancestor.id === selectedAncestorId
                ? 'h-[16rem] w-[40rem] min-w-[30rem] mx-4 bg-green-100 cursor-pointer'
                : 'h-[16rem] w-[40rem] min-w-[30rem] mx-4 cursor-pointer'
            }
            onClick={() => setSelectedAncestorId(ancestor.id)}
          >
            <CardContent>
              <Typography
                component="div"
                fontSize="1.7rem"
                fontWeight="bold"
                gutterBottom
                marginBottom="0.5rem"
              >
                {ancestor.title}
              </Typography>
              <Typography
                component="div"
                fontSize="1.3rem"
                gutterBottom
                variant="subtitle1"
              >
                {intl.formatMessage(translations.fromCourse, {
                  courseTitle: ancestor.courseTitle,
                })}
              </Typography>
              {ancestor.id === assessmentId ? (
                <Chip label={intl.formatMessage(translations.current)} />
              ) : null}
            </CardContent>
          </Card>
          {index !== ancestors.length - 1 && <ArrowBack />}
        </Fragment>
      ))}
    </div>
  </div>
);

AncestorOptions.propTypes = {
  assessmentId: PropTypes.number.isRequired,
  ancestors: PropTypes.arrayOf(ancestorShape).isRequired,
  selectedAncestorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setSelectedAncestorId: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(AncestorOptions);
