import { Card, CardContent, CardHeader } from '@mui/material';
import { grey } from '@mui/material/colors';
import { FC } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';

interface Props extends WrappedComponentProps {
  renderContent: JSX.Element;
}

const styles = {
  card: {
    marginTop: 12,
    marginBottom: 12,
    borderRadius: 5,
  },
  cardHeader: {
    borderRadius: '5px 5px 0 0',
    backgroundColor: grey[100],
  },
};

const translations = defineMessages({
  title: {
    id: 'lib.components.SummaryCard.title',
    defaultMessage: 'Summary',
  },
});

const SummaryCard: FC<Props> = (props) => {
  const { renderContent } = props;
  return (
    <Card style={styles.card}>
      <CardHeader
        style={styles.cardHeader}
        title={<FormattedMessage {...translations.title} />}
        titleTypographyProps={{
          variant: 'h6',
        }}
      />
      <CardContent>{renderContent}</CardContent>
    </Card>
  );
};

export default injectIntl(SummaryCard);
