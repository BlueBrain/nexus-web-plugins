import * as React from 'react';
import ReactDOM from 'react-dom';
import { Resource } from '@bbp/nexus-sdk';

import { NexusPluginProps } from "../../common/types";
import MINDSMetadataContainer from './MINDSMetadataContainer';

export { MINDSMetadataContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<Resource>) => {
  ReactDOM.render(
    <MINDSMetadataContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
