import * as React from 'react';
import ReactDOM from 'react-dom';

import { NexusPluginProps } from "../../common/types";
import EphysViewerContainer from './EphysViewerContainer';

import './styles.css';


export { EphysViewerContainer };

export default ({ ref, resource, nexusClient }: NexusPluginProps<{}>) => {
  ReactDOM.render(
    <EphysViewerContainer resource={resource} nexus={nexusClient} />,
    ref
  );
  return () => ReactDOM.unmountComponentAtNode(ref);
};
