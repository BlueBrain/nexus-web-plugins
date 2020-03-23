import * as React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from '../../common/types';
import MorphoViewerContainer from './MorphoViewerContainer';

export { MorphoViewerContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<{}>) => {
  ReactDOM.render(
    <MorphoViewerContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
