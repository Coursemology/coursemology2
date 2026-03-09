import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, CardHeader } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

import UserHTMLText from './UserHTMLText';

interface Props {
  description: string;
}

const translations = defineMessages({
  description: {
    id: 'lib.components.core.DescriptionCard.description',
    defaultMessage: 'Description',
  },
});

const DescriptionCard: FC<Props> = (props) => {
  const { description } = props;

  const { t } = useTranslation();

  return (
    <Card className="mt-6" variant="outlined">
      <CardHeader
        title={t(translations.description)}
        titleTypographyProps={{
          variant: 'h6',
        }}
      />

      <CardContent className="pt-0">
        <UserHTMLText html={description} />
      </CardContent>
    </Card>
  );
};

export default DescriptionCard;
