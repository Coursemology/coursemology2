import { FC } from 'react';
import {
  defineMessages,
  FormattedMessage,
  injectIntl,
  WrappedComponentProps,
} from 'react-intl';
import { Card, CardContent, CardHeader } from '@mui/material';
import { grey } from '@mui/material/colors';

interface Props extends WrappedComponentProps {
  className?: string;
  renderContent: JSX.Element;
}

const styles = {
  cardHeader: {
    borderRadius: '5px 5px 0 0',
    backgroundColor: grey[100],
  },
};

const translations = defineMessages({
  title: {
    id: 'lib.components.core.layouts.SummaryCard.title',
    defaultMessage: 'Summary',
  },
});

const SummaryCard: FC<Props> = (props) => {
  const { renderContent } = props;
  return (
    <Card className={props.className} variant="outlined">
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
