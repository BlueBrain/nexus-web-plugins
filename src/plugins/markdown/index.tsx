import * as React from 'react';
import ReactDOM from 'react-dom';
import { Resource } from '@bbp/nexus-sdk';

import { NexusPluginProps } from "../../common/types";
import MarkdownContainer from './MarkdownContainer';

export { MarkdownContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<Resource>) => {
  ReactDOM.render(
    <MarkdownContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
