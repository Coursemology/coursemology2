import React, { PropTypes } from 'react';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import { sectionShape } from '../../propTypes';
import ResultsQuestion from './ResultsQuestion';

const styles = {
  card: {
    marginBottom: 50,
  },
};

const ResultsSection = ({ section, includePhantoms }) => (
  <Card style={styles.card}>
    <CardTitle
      title={section.title}
      subtitle={section.description}
    />
    <CardText>
      {
          section.questions.map((question, index) =>
            <ResultsQuestion
              key={question.id}
              {...{ question, index, includePhantoms }}
            />
          )
        }
    </CardText>
  </Card>
);

ResultsSection.propTypes = {
  section: sectionShape.isRequired,
  includePhantoms: PropTypes.bool.isRequired,
};

export default ResultsSection;
