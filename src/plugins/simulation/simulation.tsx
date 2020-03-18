import React from 'react';
import { NexusClient } from '@bbp/nexus-sdk';

import { SimulationResource } from './types';

import BasicInfoComponent from './components/basic-info';
import AnalysisContainer from './containers/analysis';
import SlurmInfoComponent from './components/slurm-info';

import './simulation.css';

export interface SimulationProps {
  resource: SimulationResource;
  nexus: NexusClient;
}

export const Simulation = (props: SimulationProps) => {
  const { resource, nexus } = props;

  return (
    <div>
      <BasicInfoComponent resource={resource} nexus={nexus} />
      <AnalysisContainer resource={resource} nexus={nexus} />
      <SlurmInfoComponent resource={resource} />
    </div>
  );
};

export default Simulation;
