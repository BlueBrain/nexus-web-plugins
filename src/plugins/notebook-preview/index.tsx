import * as React from 'react';
import ReactDOM from 'react-dom';
import { Resource } from '@bbp/nexus-sdk';

import { NexusPluginProps } from '../../common/types';
import NotebookPreviewContainer from './NotebookPreviewContainer';

export { NotebookPreviewContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<Resource>) => {
  ReactDOM.render(
    <NotebookPreviewContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
