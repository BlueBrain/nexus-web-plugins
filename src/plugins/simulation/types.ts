import { Resource } from '@bbp/nexus-sdk';

import { ResourceLink } from "../../common";

export enum SimulationStatusEnum {
  RUNNING = 'Running',
  FAILED = 'Failed',
  DONE = 'Done',
  PENDING = 'Pending',
}

export interface SimulationResource extends Resource {
  startedAtTime: string;
  endedAtTime: string;
  generated: ResourceLink;
  status: SimulationStatusEnum;
  jobId: string;
  path: string;
}
