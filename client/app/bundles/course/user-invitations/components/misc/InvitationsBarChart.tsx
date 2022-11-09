import { defineMessages, FormattedMessage } from 'react-intl';
import palette from 'theme/palette';

import BarChart from 'lib/components/core/BarChart';

interface BarchartProps {
  accepted: number;
  pending: number;
}

const translations = defineMessages({
  accepted: {
    id: 'course.userInvitations.components.misc.InvitationsBarChart.accepted',
    defaultMessage: 'Accepted Invitations',
  },
  pending: {
    id: 'course.userInvitations.components.misc.InvitationsBarChart.pending',
    defaultMessage: 'Pending',
  },
});

const InvitationsBarChart = (props: BarchartProps): JSX.Element => {
  const { accepted, pending } = props;
  const data = [
    {
      count: pending,
      color: palette.invitationStatus.pending,
      label: <FormattedMessage {...translations.pending} />,
    },
    {
      count: accepted,
      color: palette.invitationStatus.accepted,
      label: <FormattedMessage {...translations.accepted} />,
    },
  ];

  return <BarChart data={data} />;
};

export default InvitationsBarChart;
