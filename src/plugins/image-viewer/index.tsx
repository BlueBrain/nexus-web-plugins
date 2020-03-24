import * as React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from '../../common/types';
import ImageViewerContainer from './ImageViewerContainer';

export { ImageViewerContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<{}>) => {
  ReactDOM.render(
    <ImageViewerContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
