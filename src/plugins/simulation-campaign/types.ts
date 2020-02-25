
import { Resource } from '@bbp/nexus-sdk';

import { ResourceLink } from '../../common';


export interface Simulation {
  startedAtTime: string;
  endedAtTime: string;
  status: string;
  job_id: string;
  path: string;
  self: string;
  ca?: string;
  depolarization?: string;
}

export enum SimulationStatusEnum {
  RUNNING = 'Running',
  FAILED = 'Failed',
  DONE = 'Done',
  PENDING = 'Pending'
}

export interface SimulationCampaignResource extends Resource {
  startedAtTime: string;
  endedAtTime: string;
  status: SimulationStatusEnum;
  simulations: Simulation[];
  used?: ResourceLink[];
}

export interface SimWriterConfigResource extends Resource {
  name: string;
  description: string;
  template: {
    url: string;
    data: string | undefined;
  };
  configuration: {
    url: string;
    data: string | undefined;
  };
  target?: {
    url: string;
    data: string | undefined;
  };
}
