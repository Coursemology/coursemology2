import { FC, ReactNode } from 'react';
import { defineMessages } from 'react-intl';
import { LockOpenOutlined, LockOutlined } from '@mui/icons-material';
import { Divider, IconButton, Tooltip } from '@mui/material';

import useTranslation from 'lib/hooks/useTranslation';

interface LockableSectionProps {
  onToggleLock: (key: string) => void;
  children: ReactNode;
  lockStateKey: string;
  lockState: boolean;
}

const translations = defineMessages({
  lockTooltip: {
    id: 'course.assessment.generation.lockTooltip',
    defaultMessage: 'Lock to prevent changes to this section',
  },
  unlockTooltip: {
    id: 'course.assessment.generation.unlockTooltip',
    defaultMessage: 'Unlock to continue editing this section',
  },
});

const LockableSection: FC<LockableSectionProps> = (props) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex flex-nowrap">
        <IconButton
          centerRipple={false}
          className="m-1 rounded-lg items-start"
          onClick={() => props.onToggleLock(props.lockStateKey)}
        >
          <Tooltip
            placement="top-start"
            title={
              props.lockState
                ? t(translations.unlockTooltip)
                : t(translations.lockTooltip)
            }
          >
            {props.lockState ? <LockOutlined /> : <LockOpenOutlined />}
          </Tooltip>
        </IconButton>
        {props.children}
      </div>
      <Divider className="my-4" variant="middle" />
    </>
  );
};

export default LockableSection;
