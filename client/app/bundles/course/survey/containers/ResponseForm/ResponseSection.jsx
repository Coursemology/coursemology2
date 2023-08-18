import { useFieldArray } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import ResponseAnswer from './ResponseAnswer';

const styles = {
  card: {
    marginBottom: 50,
  },
  questionCard: {
    marginBottom: 15,
  },
  errorText: {
    color: red[500],
  },
};

const translations = defineMessages({
  noAnswer: {
    id: 'course.survey.ResponseForm.ResponseSection.noAnswer',
    defaultMessage:
      'Answer is missing. Question was likely created after response was made.',
  },
});

const ResponseSection = (props) => {
  const { control, disabled, section, sectionIndex } = props;
  const { fields: questionFields } = useFieldArray({
    control,
    name: `sections.${sectionIndex}.questions`,
  });
  if (section.questions.length < 1) {
    return <div />;
  }
  return (
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
        {questionFields.map((question, questionIndex) => (
          <Card key={question.id} style={styles.questionCard}>
            <CardContent>
              <Typography
                dangerouslySetInnerHTML={{
                  __html: `${questionIndex + 1}. ${question.description}`,
                }}
                variant="body2"
              />
              {question.answer && question.answer.present ? (
                <ResponseAnswer
                  {...{
                    control,
                    disabled,
                    section,
                    sectionIndex,
                    question,
                    questionIndex,
                  }}
                />
              ) : (
                <div style={styles.errorText}>
                  <FormattedMessage {...translations.noAnswer} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </CardContent>
    </Card>
  );
};

ResponseSection.propTypes = {
  control: PropTypes.object.isRequired,
  disabled: PropTypes.bool.isRequired,
  section: PropTypes.object.isRequired,
  sectionIndex: PropTypes.number.isRequired,
};

export default ResponseSection;
