import React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps, NexusClientContext } from '../../common';

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
    <NexusClientContext.Provider value={nexusClient}>
      <SimulationCampaign
        resource={resource}
        goToResource={goToResource}
      />
    </NexusClientContext.Provider>,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
