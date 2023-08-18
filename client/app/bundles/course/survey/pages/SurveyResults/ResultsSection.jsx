import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import PropTypes from 'prop-types';

import { sectionShape } from 'course/survey/propTypes';

import ResultsQuestion from './ResultsQuestion';

const styles = {
  card: {
    marginBottom: 50,
  },
};

const ResultsSection = ({ section, includePhantoms, anonymous }) => (
  <Card style={styles.card}>
    <CardHeader
      subheader={
        <Typography
          dangerouslySetInnerHTML={{ __html: section.description }}
          variant="body2"
        />
      }
      title={section.title}
    />
    <CardContent>
      {section.questions.map((question, index) => (
        <ResultsQuestion
          key={question.id}
          {...{ question, index, includePhantoms, anonymous }}
        />
      ))}
    </CardContent>
  </Card>
);

ResultsSection.propTypes = {
  section: sectionShape.isRequired,
  includePhantoms: PropTypes.bool.isRequired,
  anonymous: PropTypes.bool.isRequired,
};

export default ResultsSection;
