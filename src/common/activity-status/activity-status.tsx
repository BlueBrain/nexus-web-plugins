import React from 'react';
import { Badge } from 'antd';

import { ActivityStatusEnum } from '../types';

interface BadgeStatus {
  [activityStatus: string]: 'processing' | 'error' | 'success' | 'warning';
}

interface ActivityStatusProps {
  status: ActivityStatusEnum;
}

const badgeStatus: BadgeStatus = {
  Pending: 'warning',
  Running: 'processing',
  Failed: 'error',
  Done: 'success',
};

export const ActivityStatus = (props: ActivityStatusProps) => {
  const { status } = props;

  return <Badge status={badgeStatus[status]} text={status} />;
};

export default ActivityStatus;
