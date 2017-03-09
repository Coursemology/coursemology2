import React, { PropTypes } from 'react';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import { sorts } from '../../utils';
import { sectionShape } from '../../propTypes';
import ResultsQuestion from './ResultsQuestion';

const styles = {
  card: {
    marginBottom: 50,
  },
};

const ResultsSection = ({ section, includePhantoms }) => {
  const { byWeight } = sorts;
  return (
    <Card style={styles.card}>
      <CardTitle
        title={section.title}
        subtitle={section.description}
      />
      <CardText>
        {
          section.questions.sort(byWeight).map((question, index) =>
            <ResultsQuestion
              key={question.id}
              {...{ question, index, includePhantoms }}
            />
          )
        }
      </CardText>
    </Card>
  );
};

ResultsSection.propTypes = {
  section: sectionShape.isRequired,
  includePhantoms: PropTypes.bool.isRequired,
};

export default ResultsSection;
