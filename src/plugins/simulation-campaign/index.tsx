import React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from '../../common/types';

import SimulationCampaign from './simulation-campaign';
import { SimulationCampaignResource } from './types';

export { SimulationCampaign };

export default ({
  ref,
  resource,
  nexusClient,
  goToResource,
}: NexusPluginProps<SimulationCampaignResource>) => {
  ReactDOM.render(
    <SimulationCampaign
      resource={resource}
      nexus={nexusClient}
      goToResource={goToResource}
    />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
