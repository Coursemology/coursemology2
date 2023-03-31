import { Fragment } from 'react';
import { injectIntl } from 'react-intl';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { Card, CardContent, Chip, Typography } from '@mui/material';
import { green } from '@mui/material/colors';
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

const defaultAncestorStyles = {
  height: '100%',
  width: '300px',
  margin: '0 1rem',
};

const styles = {
  root: {
    marginTop: '2rem',
  },
  scrollRoot: {
    width: '100%',
    overflowX: 'scroll',
    height: '200px',
    padding: '1rem 0',
    backgroundColor: '#F5F5F5',
    margin: '1rem 0 2rem 0',
    display: 'flex',
    alignItems: 'center',
  },
  currentAssessment: {
    ...defaultAncestorStyles,
    cursor: 'not-allowed',
  },
  ancestor: {
    ...defaultAncestorStyles,
    cursor: 'pointer',
  },
  selectedAncestor: {
    ...defaultAncestorStyles,
    backgroundColor: green[50],
    cursor: 'pointer',
  },
  subtitle: {
    color: 'grey',
  },
  arrow: {
    fontSize: '1rem',
  },
};

const AncestorSelect = ({
  assessmentId,
  ancestors,
  selectedAncestorId,
  setSelectedAncestorId,
  intl,
}) => {
  const getStyles = (id) => {
    if (id === assessmentId) {
      return styles.currentAssessment;
    }
    if (id === selectedAncestorId) {
      return styles.selectedAncestor;
    }
    return styles.ancestor;
  };

  return (
    <div style={styles.root}>
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
      <div style={styles.scrollRoot}>
        {ancestors.map((ancestor, index) => (
          <Fragment key={ancestor.id}>
            <Card
              onClick={() => setSelectedAncestorId(ancestor.id)}
              style={getStyles(ancestor.id)}
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
};

AncestorSelect.propTypes = {
  assessmentId: PropTypes.number.isRequired,
  ancestors: PropTypes.arrayOf(ancestorShape).isRequired,
  selectedAncestorId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setSelectedAncestorId: PropTypes.func.isRequired,
  intl: PropTypes.object.isRequired,
};

export default injectIntl(AncestorSelect);
