import { FC } from 'react';
import { defineMessages } from 'react-intl';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

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
      <CardHeader title={t(translations.description)} />

      <CardContent>
        <section className="rounded-lg bg-neutral-100 p-4">
          <Typography
            dangerouslySetInnerHTML={{ __html: description }}
            variant="body2"
          />
        </section>
      </CardContent>
    </Card>
  );
};

export default DescriptionCard;
