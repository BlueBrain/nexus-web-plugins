import React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from "../../common/types";

import { SimulationResource } from './types';
import Simulation from './simulation';

export { Simulation };

export default ({
  ref,
  resource,
  nexusClient,
}: NexusPluginProps<SimulationResource>) => {
  ReactDOM.render(<Simulation resource={resource} nexus={nexusClient} />, ref);
  return () => ReactDOM.unmountComponentAtNode(ref);
};
