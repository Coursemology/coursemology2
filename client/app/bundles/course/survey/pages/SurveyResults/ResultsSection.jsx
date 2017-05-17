import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardText, CardTitle } from 'material-ui/Card';
import { sectionShape } from 'course/survey/propTypes';
import ResultsQuestion from './ResultsQuestion';

const styles = {
  card: {
    marginBottom: 50,
  },
};

const ResultsSection = ({ section, includePhantoms, anonymous }) => (
  <Card style={styles.card}>
    <CardTitle
      title={section.title}
      subtitle={<div dangerouslySetInnerHTML={{ __html: section.description }} />}
    />
    <CardText>
      {
          section.questions.map((question, index) =>
            (<ResultsQuestion
              key={question.id}
              {...{ question, index, includePhantoms, anonymous }}
            />)
          )
        }
    </CardText>
  </Card>
);

ResultsSection.propTypes = {
  section: sectionShape.isRequired,
  includePhantoms: PropTypes.bool.isRequired,
  anonymous: PropTypes.bool.isRequired,
};

export default ResultsSection;
