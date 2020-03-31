import * as React from 'react';
import ReactDOM from 'react-dom';
import { Resource } from '@bbp/nexus-sdk';
import { NexusPluginProps } from '../../common/types';
import DataAccessContainer from './DataAccessContainer';
export { DataAccessContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<Resource>) => {
  ReactDOM.render(
    <DataAccessContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
