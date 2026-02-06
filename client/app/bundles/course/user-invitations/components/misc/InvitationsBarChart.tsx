import palette from 'theme/palette';

import BarChart from 'lib/components/core/BarChart';
import useTranslation from 'lib/hooks/useTranslation';

import translations from '../../translations';

interface BarchartProps {
  accepted: number;
  pending: number;
  failed: number;
}

const InvitationsBarChart = (props: BarchartProps): JSX.Element => {
  const { accepted, pending, failed } = props;
  const { t } = useTranslation();
  const data = [
    {
      count: pending,
      color: palette.invitationStatus.pending,
      label: t(translations.pending),
    },
    {
      count: accepted,
      color: palette.invitationStatus.accepted,
      label: t(translations.accepted),
    },
    {
      count: failed,
      color: palette.invitationStatus.failed,
      label: t(translations.failed),
    },
  ];

  return <BarChart data={data} />;
};

export default InvitationsBarChart;
