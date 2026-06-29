import type { FC } from 'react';
import { WarningAmberOutlined } from '@mui/icons-material';
import StatusState from './StatusState';
import { useSettingsStore } from '../stores/Settings';

const Error: FC = () => {
  const error = useSettingsStore((s) => s.error);

  return error ? (
    <StatusState
      icon={<WarningAmberOutlined />}
      tone="error"
      title="Couldn't reach Vulners"
      message={error}
    />
  ) : null;
};

export default Error;
