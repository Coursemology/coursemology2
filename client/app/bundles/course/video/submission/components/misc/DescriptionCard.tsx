import { FC } from 'react';
import { Card, CardContent, CardHeader } from '@mui/material';

interface Props {
  description: string;
}

const DescriptionCard: FC<Props> = (props) => {
  const { description } = props;

  return (
    <Card className="mt-6">
      <CardHeader title="Description" />
      <CardContent>
        <div
          className="well mb-0"
          dangerouslySetInnerHTML={{
            __html: description,
          }}
        />
      </CardContent>
    </Card>
  );
};

export default DescriptionCard;
