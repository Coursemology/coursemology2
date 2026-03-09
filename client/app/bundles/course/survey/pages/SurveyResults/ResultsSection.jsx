import { Card, CardContent, CardHeader } from '@mui/material';
import PropTypes from 'prop-types';

import { sectionShape } from 'course/survey/propTypes';
import UserHTMLText from 'lib/components/core/UserHTMLText';

import ResultsQuestion from './ResultsQuestion';

const styles = {
  card: {
    marginBottom: 50,
  },
};

const ResultsSection = ({ section, anonymous, answerFilter }) => (
  <Card style={styles.card}>
    <CardHeader
      subheader={<UserHTMLText html={section.description} />}
      title={section.title}
    />
    <CardContent>
      {section.questions.map((question, index) => (
        <ResultsQuestion
          key={question.id}
          {...{ question, index, anonymous, answerFilter }}
        />
      ))}
    </CardContent>
  </Card>
);

ResultsSection.propTypes = {
  section: sectionShape.isRequired,
  anonymous: PropTypes.bool.isRequired,
  answerFilter: PropTypes.func.isRequired,
};

export default ResultsSection;
