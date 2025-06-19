import { useFieldArray } from 'react-hook-form';
import { defineMessages, FormattedMessage } from 'react-intl';
import { Card, CardContent, CardHeader, Chip, Typography } from '@mui/material';
import { red } from '@mui/material/colors';
import PropTypes from 'prop-types';

import useTranslation from 'lib/hooks/useTranslation';
import formTranslations from 'lib/translations/form';

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
  const { t } = useTranslation();
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
            <CardContent className="relative">
              <div className="absolute -left-5 top-6 flex items-center justify-center rounded-full wh-10 bg-neutral-500">
                <Typography color="white" variant="body2">
                  {questionIndex + 1}
                </Typography>
              </div>
              {question.required && (
                <Chip
                  color="error"
                  label={t(formTranslations.starRequired)}
                  size="small"
                  variant="outlined"
                />
              )}
              <Typography
                component="div"
                dangerouslySetInnerHTML={{
                  __html: question.description,
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
