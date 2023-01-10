import { FC } from 'react';
import { Card, CardContent, CardHeader, Typography } from '@mui/material';

interface Props {
  description: string;
}

const DescriptionCard: FC<Props> = (props) => {
  const { description } = props;

  return (
    <Card className="mt-6">
      <CardHeader title="Description" />
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
