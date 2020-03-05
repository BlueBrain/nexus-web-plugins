import * as React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from '../../common/types';
import EphysContainer from './EphysContainer';

export { EphysContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<{}>) => {
  ReactDOM.render(
    <EphysContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
