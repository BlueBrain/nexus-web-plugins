import React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from '../../common/types';

import { SimWriterConfig } from './sim-writer-config';

import { SimWriterConfigResource, NexusClientContext } from '../../common';

export { SimWriterConfig };

export default ({
  ref,
  resource,
  nexusClient,
}: NexusPluginProps<SimWriterConfigResource>) => {
  ReactDOM.render(
    <NexusClientContext.Provider value={nexusClient}>
      <SimWriterConfig resource={resource} />
    </NexusClientContext.Provider>,
    ref
  );

  return () => ReactDOM.unmountComponentAtNode(ref);
};
