import { Control } from 'react-hook-form';

import BrowserAuthorizationOptionsFormFields from './BrowserAuthorizationOptionsFormFields';
import MonitoringIntervalsFormFields from './MonitoringIntervalsFormFields';

const MonitoringOptionsFormFields = ({
  control,
  pulsegridUrl,
  disabled,
}: {
  control: Control;
  pulsegridUrl?: string;
  disabled?: boolean;
}): JSX.Element => {
  return (
    <>
      <BrowserAuthorizationOptionsFormFields
        control={control}
        disabled={disabled}
        pulsegridUrl={pulsegridUrl}
      />

      <MonitoringIntervalsFormFields control={control} disabled={disabled} />
    </>
  );
};

export default MonitoringOptionsFormFields;
