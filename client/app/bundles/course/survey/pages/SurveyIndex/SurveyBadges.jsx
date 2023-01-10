import { defineMessages } from 'react-intl';
import { FormatListBulleted } from '@mui/icons-material';
import { Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import { surveyShape } from '../../propTypes';

const translations = defineMessages({
  hasTodo: {
    id: 'course.survey.SurveyBadges.hasTodo',
    defaultMessage: 'has TODO',
  },
});

const SurveyBadges = (props) => {
  const { survey } = props;
  const { t } = useTranslation();

  return (
    <div className="flex items-center space-x-2 max-xl:mt-2 xl:ml-2">
      {survey.has_todo && (
        <Tooltip disableInteractive title={t(translations.hasTodo)}>
          <FormatListBulleted className="text-3xl text-neutral-500 hover?:text-neutral-600" />
        </Tooltip>
      )}
    </div>
  );
};

SurveyBadges.propTypes = {
  survey: surveyShape,
};

export default SurveyBadges;
