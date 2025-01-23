import { FC, ReactNode } from 'react';
import { LockOpenOutlined, LockOutlined } from '@mui/icons-material';
import { Divider, IconButton } from '@mui/material';

interface LockableSectionProps {
  onToggleLock: (key: string) => void;
  children: ReactNode;
  lockStateKey: string;
  lockState: boolean;
}

const LockableSection: FC<LockableSectionProps> = (props) => (
  <>
    <div className="flex flex-nowrap">
      <IconButton
        centerRipple={false}
        className="m-1 rounded-lg items-start"
        onClick={() => props.onToggleLock(props.lockStateKey)}
      >
        {props.lockState ? <LockOutlined /> : <LockOpenOutlined />}
      </IconButton>
      {props.children}
    </div>
    <Divider className="my-4" variant="middle" />
  </>
);

export default LockableSection;
