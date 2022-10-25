import React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from '../../common/types';

import { SimCampaignConfig } from './sim-campaign-config';

import { SimCampaignConfigResource, NexusClientContext } from '../../common';

export { SimCampaignConfig };

export default ({
  ref,
  resource,
  nexusClient,
}: NexusPluginProps<SimCampaignConfigResource>) => {
  ReactDOM.render(
    <NexusClientContext.Provider value={nexusClient}>
      <SimCampaignConfig resource={resource} />
    </NexusClientContext.Provider>,
    ref
  );

  return () => ReactDOM.unmountComponentAtNode(ref);
};
